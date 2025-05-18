import { CookieOptions, Request, Response } from "express";
import jwt from "jsonwebtoken";
import mongoose, { isValidObjectId } from "mongoose";
import Url from "../model/url.model";
import User from "../model/user.model";
import {
    createUserData,
    createUserSchemaZod,
    loginUserSchemaZod,
    userLoginData,
} from "../schema/user.schema";
import { UserResponse } from "../types/user.type";
import ApiError from "../utils/ApiError";
import ApiResponse from "../utils/ApiResponse";
import asyncHandler from "../utils/asyncHandler";
import { generateAccessAndRefershToken } from "../utils/user.utils";

const opions: CookieOptions = {
    secure: true,
    httpOnly: true,
    sameSite: "strict",
};

const registerUser = asyncHandler(
    async (req: Request<{}, {}, createUserData>, res: Response) => {
        const zodStatus = createUserSchemaZod.safeParse(req.body);

        if (!zodStatus.success) {
            const errorMsg = zodStatus.error.errors
                .map((e) => e.message)
                .join(", ");
            throw new ApiError(
                400,
                errorMsg || "Invalid input for user creation"
            );
        }

        const { username, email, password } = zodStatus.data;

        const existingUser = await User.findOne({
            $or: [{ username: username }, { email: email }],
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
                [
                    {
                        username: username,
                        email: email,
                        password: password,
                    },
                ],
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

            await session.commitTransaction();

            return res
                .status(201)
                .json(new ApiResponse(201, user, "User register successfully"));
        } catch (error) {
            await session.abortTransaction();
            console.error(error);
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
    async (req: Request<any, any, userLoginData>, res: Response) => {
        const zodStatus = loginUserSchemaZod.safeParse(req.body);
        if (!zodStatus.success) {
            const errorMsg = zodStatus.error.errors
                .map((e) => e.message)
                .join(", ");
            throw new ApiError(
                400,
                errorMsg || "Invalid input for user creation"
            );
        }

        const { email, password } = zodStatus.data;
        // try to find user by email id
        const user = await User.findOne({
            email: email,
        });

        if (!user) throw new ApiError(400, "User not exists");

        const passwordCheck = await user.checkPassword(password);

        if (!passwordCheck) throw new ApiError(401, "Invalid password");

        const { accessToken, refreshToken } =
            await generateAccessAndRefershToken(user._id);

        // store the access token in cookie
        const userResponse = {
            _id: user._id,
            username: user.username,
            email: user.email,
        };
        res.cookie("accessToken", accessToken!, opions)
            .cookie("refershToken", refreshToken!, opions)
            .json(
                new ApiResponse(
                    200,
                    { ...userResponse },
                    // Optinal send  accessToken, refreshToken
                    "User loggegin successfully"
                )
            );
    }
);

const logoutUser = asyncHandler(async (req, res) => {
    const userId = req.user?._id;
    if (!isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid userId");
    }
    await User.findByIdAndUpdate(userId, {
        $set: {
            refreshToken: 1,
        },
    });
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
        )
            .select("-password -refreshToken")
            .lean();
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

        // now remove user itself
        const isUserExists = await User.findByIdAndDelete(userId);
        if (!isUserExists) {
            console.error("Failed To delete suser");
        }

        await session.commitTransaction();

        return res
            .status(200)
            .clearCookie("accessToken", opions)
            .clearCookie("refershToken", opions)
            .json(new ApiResponse(200, "User Successfully Deleted"));
    } catch (error) {
        // any error abort it
        await session.abortTransaction();
        throw new ApiError(
            500,
            "Failed to delete user due to an internal error"
        );
    } finally {
        await session.endSession();
    }
});

const getInfoOfUser = asyncHandler(async (req, res) => {
    const userId = req.user?._id;
    if (!isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid userId");
    }

    const user = await User.findById(userId).lean();

    if (!user) {
        throw new ApiError(404, "Uset does not exists");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, user, "User Data fecthed successfully"));
});

export {
    deleteUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    registerUser,
    getInfoOfUser,
};
