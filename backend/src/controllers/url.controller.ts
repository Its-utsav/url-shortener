import { Request, Response } from "express";
import Url from "../model/url.model";
import asyncHandler from "../utils/asyncHandler";
import { ObjectId } from "mongoose";
import ApiError from "../utils/ApiError";
import { urlSchemaZod } from "../schema/url.schema";
import ApiResponse from "../utils/ApiResponse";
import visitedHistory from "../model/visitedHistory.model";

interface IncomeingUrlData {
    originalUrl: string;
    description: string;
    isPasswordProtected?: boolean;
    password?: string;
}

interface fullDataForShortUrl extends IncomeingUrlData {
    createdBy: ObjectId;
}

const createShortUrl = asyncHandler(
    async (req: Request<any, any, IncomeingUrlData>, res) => {
        const { originalUrl, description, isPasswordProtected, password } =
            req.body;

        const zodStatus = urlSchemaZod.safeParse({
            originalUrl,
            description,
            isPasswordProtected,
            password,
        });

        const errorMsg = zodStatus.error?.errors
            .map((e: { message: any }) => e.message)
            .join(", ");

        if (!zodStatus.success) {
            throw new ApiError(400, errorMsg);
        }

        const data: Partial<fullDataForShortUrl> = {
            ...zodStatus.data,
            createdBy: req.user?._id,
        };
        if (!data.isPasswordProtected) {
            delete data.password;
        }
        if (
            data.isPasswordProtected === true &&
            (data.password?.trim() === "" || !password)
        ) {
            throw new ApiError(
                400,
                "If short url is password protected then password field is compulsory"
            );
        }

        const shortUrl = await Url.create(data);
        if (!shortUrl)
            throw new ApiError(500, "Error while creating short url");
        const shortUrlData = shortUrl.toObject();
        delete shortUrlData.password;
        return res
            .status(201)
            .json(
                new ApiResponse(
                    201,
                    shortUrlData,
                    "Short url created successfully"
                )
            );
    }
);

const redirectToOriginalUrl = asyncHandler(
    async (req: Request, res: Response) => {
        const { shortUrl } = req.params;
        if (!shortUrl) throw new ApiError(401, "Short Url not provided");

        const url = await Url.findOne({ shortUrl: shortUrl });

        if (!url) throw new ApiError(404, "Url not found");

        const ip = req.headers["x-real-ip"] || req.socket.remoteAddress;

        // Check if the URL requires a password
        if (!url.isPasswordProtected) {
            const clientInfo = await visitedHistory.create({
                shortUrlId: url._id,
                ipAddress: ip,
                deviceType: req.useragent?.platform,
                clickedTime: Date.now(),
            });

            return res.status(307).redirect(url.originalUrl);
        } else {
            // TODO :-> Redirect on frontend form
            // -> for password input
            return res.json(url);
            // return res.redirect(`/api/v1/url/password/${shortUrl}`);
        }
    }
);

interface IShortUrl {
    shortUrl?: string;
}

const redirectToProtectedUrl = asyncHandler(
    async (
        req: Request<IShortUrl, any, { passowrd: string }>,
        res: Response
    ) => {
        const { shortUrl } = req.params;
        const { passowrd } = req.body;

        if (!shortUrl) {
            throw new ApiError(400, "shortUrl is not provided");
        }

        const url = await Url.findOne({ shortUrl });

        if (!url) {
            throw new ApiError(404, "Url not found");
        }

        // no password than redirect it
        if (!url.isPasswordProtected) {
            return res.redirect(url.originalUrl);
        }

        if (!passowrd) {
            throw new ApiError(401, "Unauthorized Request password missing");
        }

        const isValidPassword = await url.checkPassword(passowrd);

        if (!isValidPassword) {
            throw new ApiError(401, "Unauthorized Request , wrong password");
        }
        const ip = req.headers["x-real-ip"] || req.socket.remoteAddress;

        const clientInfo = await visitedHistory.create({
            shortUrlId: url._id,
            ipAddress: ip,
            deviceType: req.useragent?.platform,
            clickedTime: Date.now(),
        });

        return res.redirect(url.originalUrl);
    }
);

const updateShortUrl = asyncHandler(
    async (req: Request<IShortUrl, any, { desc: string }>, res: Response) => {
        const { desc } = req.body;
        const { shortUrl } = req.params;
        if (!desc) {
            throw new ApiError(400, "Description not provided");
        }

        if (!shortUrl) {
            throw new ApiError(400, "Short Url is not provided");
        }

        const url = await Url.findOneAndUpdate(
            { shortUrl },
            {
                description: desc,
            },
            {
                new: true,
            }
        ).select("-password");

        if (!url) {
            throw new ApiError(404, "Url not found");
        }
        return res
            .status(200)
            .json(new ApiResponse(200, url, "Short Url updated successfully"));
    }
);

const deleteShortUrl = asyncHandler(
    async (req: Request<IShortUrl>, res: Response) => {
        const { shortUrl } = req.params;
        if (!shortUrl) {
            throw new ApiError(400, "Short Url id not provided");
        }

        const url = await Url.findOneAndDelete({ shortUrl });

        if (!url) {
            throw new ApiError(404, "Url not found");
        }

        const history = await visitedHistory.findOneAndDelete({
            shortUrlId: url._id,
        });

        return res
            .status(200)
            .json(new ApiResponse(200, "Short Url successfully deleteed"));
    }
);

const getAnalytics = asyncHandler(
    async (req: Request<IShortUrl>, res: Response) => {
        const { shortUrl } = req.params;
        if (!shortUrl) {
            throw new ApiError(400, "Short Url id not provided");
        }

        const url = await Url.findOne({ shortUrl });
        // const totalClicks =  await Url.countDocuments()
        if (!url) {
            throw new ApiError(404, "Url not found");
        }

        const data = await visitedHistory.aggregate([
            {
                $match: {
                    shortUrlId: url?._id,
                },
            },
            {
                $group: {
                    _id: "$deviceType",
                    totalClicks: { $sum: 1 },
                },
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: "$totalClicks" },
                    counts: {
                        $push: {
                            deviceType: "$_id",
                            totalClicks: "$totalClicks",
                        },
                    },
                },
            },
            {
                $unwind: "$counts",
            },
            {
                $project: {
                    deviceType: "$counts.deviceType",
                    totalClicks: "$counts.totalClicks",
                    percentOfTotal: {
                        $multiply: [
                            { $divide: ["$counts.totalClicks", "$total"] },
                            100,
                        ],
                    },
                },
            },
        ]);
        console.log(data);
        if (!data || data?.length == 0) {
            throw new ApiError(404, "Url not found");
        }
        return res
            .status(200)
            .json(new ApiResponse(200, data, "Url info fetched successfully"));
    }
);

export {
    createShortUrl,
    redirectToOriginalUrl,
    updateShortUrl,
    deleteShortUrl,
    getAnalytics,
    redirectToProtectedUrl,
};
