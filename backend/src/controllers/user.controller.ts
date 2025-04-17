import { Request, Response } from "express";
import User from "../model/user.model";
import { userSchemaZod } from "../schema/user.schema";
import { IUser } from "../types/user.type";
import ApiError from "../utils/ApiError";
import ApiResponse from "../utils/ApiResponse";
import asyncHandler from "../utils/asyncHandler";
import { generateAccessAndRefershToken } from "../utils/user.utils";
import jwt from "jsonwebtoken";

const opions = {
    secure: true,
    httpOnly: true,
};

const registerUser = asyncHandler(
    async (req: Request<any, any, IUser>, res: Response) => {
        const { username, email, password } = req.body;

        const zodStatus = userSchemaZod.safeParse({
            email: email,
            username: username,
            password: password,
        });

        const errorMsg = zodStatus.error?.errors
            .map((e: { message: any }) => e.message)
            .join(", ");

        if (!zodStatus.success) {
            throw new ApiError(400, errorMsg);
        }

        const existingUserByUserName = await User.findOne({
            username,
        });

        if (existingUserByUserName) {
            throw new ApiError(
                400,
                `User alreay exist with ${username} username`
            );
        }

        const existingUserByEmail = await User.findOne({
            email,
        });

        if (existingUserByEmail) {
            throw new ApiError(400, `User alreay exist with ${email} email`);
        }

        const user = await User.create({
            username,
            email,
            password,
        });

        const createdUser = await User.findById(user._id)
            .select("-password -refreshToken")
            .lean();

        if (!user || !createdUser) {
            throw new ApiError(
                500,
                "Something went wrong while registering user."
            );
        }

        return res
            .status(201)
            .json(
                new ApiResponse(200, createdUser, "User register successfully")
            );
    }
);

const loginUser = asyncHandler(
    async (
        req: Request<any, any, { email: string; password: string }>,
        res: Response
    ) => {
        // email , password
        const { email, password } = req.body;
        if (!email) throw new ApiError(400, "Email not provided");
        if (!password) throw new ApiError(400, "password not provided");

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

export { registerUser, loginUser, logoutUser, refreshAccessToken };
