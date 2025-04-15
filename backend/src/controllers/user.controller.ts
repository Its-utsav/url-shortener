import User from "../model/user.model";
import ApiResponse from "../utils/ApiResponse";
import asyncHandler from "../utils/asyncHandler";
import { IUser } from "../types/user.type";
import { Request, RequestHandler, Response } from "express";
import { z } from "zod";
import { userSchemaZod } from "../schema/user.schema";
import ApiError from "../utils/ApiError";

const registerUser = asyncHandler(
    async (req: Request<any, any, IUser>, res: Response) => {
        const { username, email, password } = req.body;

        const zodStatus = userSchemaZod.safeParse({
            email: email,
            username: username,
            password: password,
        });

        const errorMsg = zodStatus
            .error?.errors.map((e) => e.message)
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
            throw new ApiError(
                400,
                `User alreay exist with ${email} email`
            );
        }
        const user = await User.create({
            username,
            email,
            password,
        });

        const createdUser = await User.findById(user._id).select(
            "-password -refreshToken"
        ).lean();

        console.log(createdUser)
        if (!user || !createdUser) {
            throw new ApiError(500, "Something went wrong while registering user.");
        }

        return res
            .status(201)
            .json(
                new ApiResponse(200, createdUser, "User register successfully")
            );
    }
);

export { registerUser };
