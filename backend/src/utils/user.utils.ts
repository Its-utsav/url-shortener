import mongoose from "mongoose";
import User from "../model/user.model";
import ApiError from "./ApiError";

export const generateAccessAndRefershToken = async (
    userId: mongoose.Types.ObjectId
): Promise<{
    accessToken: string | undefined;
    refreshToken: string | undefined;
}> => {
    try {
        const user = await User.findById(userId);
        const accessToken = user?.generateAccessToken();
        const refreshToken = user?.generateRefershToken();
        await User.findByIdAndUpdate(userId, {
            refreshToken: refreshToken,
        });
        return { accessToken, refreshToken };
    } catch (e) {
        console.error(e);
        throw new ApiError(
            500,
            "Error while generating access and refersh token"
        );
    }
};
