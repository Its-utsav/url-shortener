import jwt from "jsonwebtoken";
import User from "../model/user.model";
import ApiError from "../utils/ApiError";
import asyncHandler from "../utils/asyncHandler";

export const verifyJWT = asyncHandler(async (req, _, next) => {
    try {
        const accessToken =
            req.headers.authorization?.replace("Bearer ", "") ||
            req.cookies?.accessToken;

        if (!accessToken) throw new ApiError(401, "Unauthorized request");

        const decodeInfo = jwt.verify(
            accessToken,
            process.env.ACCESSTOKEN_KEY as string
        );

        if (typeof decodeInfo === "string")
            throw new ApiError(401, "Unauthorized request");

        const user = await User.findById(decodeInfo._id);

        if (!user) throw new ApiError(401, "User not found");

        req.user = user;
        next();
    } catch (error) {
        console.error(error);
        throw new ApiError(401, "Invalid access token");
    }
});
