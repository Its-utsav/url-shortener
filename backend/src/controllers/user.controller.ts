import { CookieOptions, Request, Response } from "express";
import User from "../model/user.model";
import { userLoginSchemaZod, userSchemaZod } from "../schema/user.schema";
import { IUser, UserResponse } from "../types/user.type";
import ApiError from "../utils/ApiError";
import ApiResponse from "../utils/ApiResponse";
import asyncHandler from "../utils/asyncHandler";
import { generateAccessAndRefershToken } from "../utils/user.utils";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import Url from "../model/url.model";

const opions: CookieOptions = {
    secure: true,
    httpOnly: true,
    sameSite: "strict"
};

const registerUser = asyncHandler(
    async (req: Request<any, any, IUser>, res: Response) => {
        const { username, email, password } = req.body;

        const zodStatus = userSchemaZod.safeParse({
            email: email,
            username: username,
            password: password,
        });

        if (!zodStatus.success) {
            const errorMsg = zodStatus.error.errors
                .map((e) => e.message)
                .join(", ");
            throw new ApiError(
                400,
                errorMsg || "Invalid input for user creation"
            );
        }
        const data = zodStatus.data;
        const existingUser = await User.findOne({
            $or: [{ username: data.username }, { email: data.email }],
        });

        if (existingUser) {
            let foundBy = "";
            if (existingUser.username === username) foundBy = "username";
            if (existingUser.email === email) foundBy = "email";
            throw new ApiError(400, `User alreay exist with ${foundBy}`);
        }

        const session = await mongoose.startSession();
        try {
            session.startTransaction();
            const createdUser = await User.create(
                {
                    username: data.username,
                    email: data.email,
                    password: data.password,
                },
                { session }
            );

            if (!createdUser || createdUser.length == 0) {
                await session.abortTransaction();
                throw new ApiError(500, "Failed to create user document.");
            }

            const newUser = createdUser[0].toObject();

            const user: UserResponse = {
                _id: newUser._id,
                username: newUser.username,
                email: newUser.email,
            };

            session.commitTransaction();

            return res
                .status(201)
                .json(new ApiResponse(201, user, "User register successfully"));
        } catch (error) {
            await session.abortTransaction();
            throw new ApiError(
                500,
                "Faild to create user due to internal server error"
            );
        } finally {
            await session.endSession();
        }
    }
);

const loginUser = asyncHandler(
    async (
        req: Request<any, any, { email: string; password: string }>,
        res: Response
    ) => {
        // email , password
        const { email, password } = req.body;
        const zodStatus = userLoginSchemaZod.safeParse({
            email,
            password,
        });
        if (!zodStatus.success) {
            const errorMsg = zodStatus.error.errors
                .map((e) => e.message)
                .join(", ");
            throw new ApiError(
                400,
                errorMsg || "Invalid input for user creation"
            );
        }

        const user = await User.findOne({
            email: email,
        });
        if (!user) throw new ApiError(400, "User not exists");

        const passwordCheck = await user.checkPassword(password);

        if (!passwordCheck) throw new ApiError(401, "Invalid password");

        const { accessToken, refreshToken } =
            await generateAccessAndRefershToken(user._id);

        // store the access token in cookie

        res.cookie("accessToken", accessToken!, opions)
            .cookie("refershToken", refreshToken!, opions)
            .json(
                new ApiResponse(
                    200,
                    { ...user.toObject(), accessToken, refreshToken },
                    "User loggegin successfully"
                )
            );
    }
);

const logoutUser = asyncHandler(async (req, res) => {
    const userId = req.user?._id;
    await User.findByIdAndUpdate(
        userId,
        {
            refreshToken: 1,
        },
        { new: true }
    );
    return res
        .status(200)
        .clearCookie("accessToken", opions)
        .clearCookie("refershToken", opions)
        .json(new ApiResponse(200, "User Logged Out successfully"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
    // get refreshtoken from cookies and validate it if ok than give new access token
    const recivedRefereshToken =
        req.headers.authorization?.replace("Bearer ", "") ||
        req.cookies("refershToken");

    if (!recivedRefereshToken)
        throw new ApiError(
            401,
            "RefershToken were not provided, Unauthorized request"
        );

    try {
        const decodeInfo = jwt.verify(
            recivedRefereshToken,
            process.env.REFERSHTOKEN_KEY as string
        );

        if (typeof decodeInfo === "string" || !decodeInfo)
            throw new ApiError(401, "Unauthorized request");

        const user = await User.findById(decodeInfo._id);

        if (!user) throw new ApiError(400, "User not found");

        if (recivedRefereshToken !== user.refreshToken)
            throw new ApiError(401, "Refresh Token is already used or invalid");
        const { accessToken, refreshToken } =
            await generateAccessAndRefershToken(user._id);
        const updatedUser = await User.findByIdAndUpdate(
            user._id,
            {
                refreshToken: refreshToken,
            },
            {
                new: true,
            }
        ).select("-password -refreshToken");
        res.cookie("accessToken", accessToken!, opions)
            .cookie("refershToken", refreshToken!, opions)
            .json(
                new ApiResponse(
                    200,
                    { ...updatedUser?.toObject(), accessToken, refreshToken },
                    "Refresh Token is update"
                )
            );
    } catch (error) {
        throw new ApiError(
            401,
            "Something went wrong while Refreshing refresh token"
        );
    }
});

const deleteUser = asyncHandler(async (req, res) => {
    const userId = req.user?._id;
    const session = await mongoose.startSession();
    try {
        session.startTransaction();
        // remove all short url links created by currently loggedin user
        const deleteUrl = await Url.deleteMany({ createdBy: userId }).session(
            session
        );
        if (!deleteUrl.acknowledged) {
            await session.abortTransaction();
            throw new ApiError(
                500,
                "Internal server errror while deleting the user "
            );
        }

        // now remove user it self
        const isUserExists = await User.findByIdAndDelete(userId);
        if (!isUserExists) {
            // no user foudn abort it
            await session.abortTransaction();
            throw new ApiError(404, "User not exists");
        }

        session.commitTransaction();

        return res
            .status(200)
            .clearCookie("accessToken", opions)
            .clearCookie("refershToken", opions)
            .json(new ApiResponse(200, "User Successfully Deleted"));
    } catch (error) {
        // any error abourt it
        session.abortTransaction();
        throw new ApiError(
            500,
            "Failed to delete user due to an internal error"
        );
    } finally {
        session.endSession();
    }
});

export { registerUser, loginUser, logoutUser, refreshAccessToken, deleteUser };
