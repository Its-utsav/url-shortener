import { Request, Response, NextFunction, RequestHandler } from "express";
import ApiError from "./ApiError";

// type AsyncRequestHanler = (
//     req: Request,
//     res: Response,
//     next: NextFunction
// ) => Promise<void> | void;

// type ExpressMiddelware = (
//     req: Request,
//     res: Response,
//     next: NextFunction
// ) => void;

// const asyncHandler = (requestHandler: AsyncRequestHanler): ExpressMiddelware => {
//     return (req: Request, res: Response, next: NextFunction) => {
//         Promise.resolve(requestHandler(req, res, next)).catch((error) =>
//             next(error)
//         );
//     };
// };

// const asyncHandler = (requestHandler: RequestHandler): RequestHandler => {
//     return (req: Request, res: Response, next: NextFunction) => {
//         Promise.resolve(requestHandler(req, res, next)).catch((error) =>
//             next(error)
//         );
//     };
// };

const asyncHandler = (requestHandler: RequestHandler): RequestHandler => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            await Promise.resolve(requestHandler(req, res, next));
        } catch (error: unknown) {
            if (error instanceof ApiError) {
                return res.status(error.statusCode || 500).json({
                    success: false,
                    message: error.message,
                });
            }
            console.log(error);
            return res
                .status(500)
                .json({ success: false, message: "Internal Server Error" });
        }
    };
};

export default asyncHandler;
