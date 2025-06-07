import { Request, Response } from "express";
import mongoose from "mongoose";
import Url from "../model/url.model";
import visitedHistory from "../model/visitedHistory.model";
import {
    updatedUrlData,
    updateUrlSchemaZod,
    urlSchemaZod,
} from "../schema/url.schema";
import {
    fullDataForShortUrlCreation,
    IncomeingUrlData,
    IShortUrl,
} from "../types/url.type";
import ApiError from "../utils/ApiError";
import ApiResponse from "../utils/ApiResponse";
import asyncHandler from "../utils/asyncHandler";

const createShortUrl = asyncHandler(
    async (req: Request<{}, {}, IncomeingUrlData>, res) => {
        const zodStatus = urlSchemaZod.safeParse(req.body);

        if (!zodStatus.success) {
            const errorMsg = zodStatus.error.errors
                .map((e) => e.message)
                .join(", ");
            throw new ApiError(
                400,
                errorMsg || "Invalid data for Short Url creation"
            );
        }
        const { originalUrl, description, isPasswordProtected, password } =
            zodStatus.data;
        const data: Partial<fullDataForShortUrlCreation> = {
            originalUrl,
            description,
            isPasswordProtected,
            password,
            createdBy: req.user?._id,
        };
        // if isPasswordProtected false than no need of password so delete from password
        if (!data.isPasswordProtected) {
            delete data.password;
        }
        const session = await mongoose.startSession();
        try {
            session.startTransaction();
            const shortUrl = await Url.create(data);
            if (!shortUrl) {
                await session.abortTransaction();
                throw new ApiError(500, "Error while creating short url");
            }
            await session.commitTransaction();
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
        } catch (error) {
            console.log("Error while short url creation", error);
            await session.abortTransaction();
            throw new ApiError(400, "Error while Short Url Creaation");
        } finally {
            await session.endSession();
        }
    }
);

const redirectToOriginalUrl = asyncHandler(
    async (req: Request, res: Response) => {
        const { shortUrl } = req.params;
        if (!shortUrl) {
            throw new ApiError(401, "Short Url not provided");
        }

        const url = await Url.findOne({ shortUrl: shortUrl });

        if (!url) {
            throw new ApiError(404, "Url not found");
        }

        const ip = req.headers["x-real-ip"] || req.socket.remoteAddress;

        // Check if the URL requires a password
        if (!url.isPasswordProtected) {
            await visitedHistory.create({
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

const redirectToProtectedUrl = asyncHandler(
    async (
        req: Request<IShortUrl, {}, { password: string }>,
        res: Response
    ) => {
        const { shortUrl } = req.params;
        const { password } = req.body;

        if (!shortUrl) {
            throw new ApiError(400, "shortUrl is not provided");
        }

        const url = await Url.findOne({ shortUrl: shortUrl });

        if (!url) {
            throw new ApiError(404, "Url not found");
        }

        // no password than redirect it
        if (!url.isPasswordProtected) {
            return res.redirect(url.originalUrl);
        }

        if (!password) {
            throw new ApiError(401, "Unauthorized Request password missing");
        }

        const isValidPassword = await url.checkPassword(password);

        if (!isValidPassword) {
            throw new ApiError(401, "Unauthorized Request , wrong password");
        }
        const ip = req.headers["x-real-ip"] || req.socket.remoteAddress;

        await visitedHistory.create({
            shortUrlId: url._id,
            ipAddress: ip,
            deviceType: req.useragent?.platform,
            clickedTime: Date.now(),
        });

        return res.status(307).redirect(url.originalUrl);
    }
);

const updateShortUrl = asyncHandler(
    async (req: Request<IShortUrl, {}, updatedUrlData>, res: Response) => {
        const { description, isPasswordProtected, password } = req.body;
        const { shortUrl } = req.params;

        if (!shortUrl) {
            throw new ApiError(400, "Short Url parameter is required");
        }

        const zodUrlUpdateStatus = updateUrlSchemaZod.safeParse({
            description,
            isPasswordProtected,
            password,
        });

        if (!zodUrlUpdateStatus.success) {
            const errorMessage = zodUrlUpdateStatus.error.errors
                .map((e) => e.message)
                .join(", ");
            throw new ApiError(400, errorMessage || "Invalid update data");
        }

        const url = await Url.findOne({ shortUrl });

        if (!url) {
            throw new ApiError(404, "Url not found");
        }

        if (url.createdBy.toString() !== req.user?._id.toString()) {
            throw new ApiError(
                403,
                "You are not authorized to update this URL"
            );
        }
        const updatedData = zodUrlUpdateStatus.data;
        let updateStatus = false;

        // description provided and it should not be same is as previous

        if (
            updatedData.description != undefined &&
            url.description != updatedData.description
        ) {
            url.description = updatedData.description;
            updateStatus = true;
        }

        // update password
        // isPasswordProtected -> true
        if (isPasswordProtected) {
            // Currently isPasswordProtected is false
            // url.isPassword -> false -> so need to update to true
            // new password not same with old one
            if (
                url.isPasswordProtected === false ||
                !(await url.checkPassword(updatedData.password!))
            ) {
                url.isPasswordProtected = true;
                url.password = updatedData.password;
                updateStatus = true;
            }
        } else {
            // isPasswordProtected -> false
            // Currently isPasswordProtected must be true
            // so remove  isPasswordProtected  and password
            if (url.isPasswordProtected == true) {
                url.isPasswordProtected = false;
                url.password = undefined;
                updateStatus = true;
            }
        }

        // if nothing change so return response

        if (!updateStatus) {
            return res.status(200).json(
                new ApiResponse(200, {
                    url: url.toObject({ virtuals: true }),
                })
            );
        }

        // something updated so save it

        const updatedUrl = await url.save();
        const urlObject = updatedUrl.toObject({ virtuals: true });

        delete urlObject.password;

        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    { url: urlObject },
                    "Short Url Update Successfully"
                )
            );
    }
);

const deleteShortUrl = asyncHandler(
    async (req: Request<IShortUrl>, res: Response) => {
        const { shortUrl } = req.params;
        if (!shortUrl) {
            throw new ApiError(400, "Short Url id not provided");
        }

        const session = await mongoose.startSession();

        try {
            session.startTransaction();
            const url = await Url.findOneAndDelete({ shortUrl }, { session });

            if (!url) {
                await session.abortTransaction();
                throw new ApiError(404, "Url not found");
            }

            await visitedHistory.deleteMany(
                {
                    shortUrlId: url._id,
                },
                { session }
            );

            await session.commitTransaction();
            return res
                .status(200)
                .json(
                    new ApiResponse(200, {}, "Short Url successfully deleteed")
                );
        } catch (error) {
            console.error(`Error while deleteing the short url ${error}`);
            await session.abortTransaction();
            throw new ApiError(500, "Internal Server error");
        } finally {
            await session.endSession();
        }
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

        if (url.createdBy.toString() !== req.user?._id.toString()) {
            throw new ApiError(
                403,
                "You are not authorized to view analytics for this URL"
            );
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
                    percentageField: {
                        $multiply: [
                            { $divide: ["$counts.totalClicks", "$total"] },
                            100,
                        ],
                    },
                },
            },
            {
                $project: {
                    deviceType: 1,
                    totalClicks: 1,
                    _id: 0,
                    percentage: {
                        $round: ["$percentageField", 2],
                    },
                },
            },
        ]);

        if (!data || data?.length == 0) {
            throw new ApiError(404, "No Data found");
        }

        return res
            .status(200)
            .json(new ApiResponse(200, data, "Url info fetched successfully"));
    }
);

export {
    createShortUrl,
    deleteShortUrl,
    getAnalytics,
    redirectToOriginalUrl,
    redirectToProtectedUrl,
    updateShortUrl
};

