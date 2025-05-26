import { NextFunction, Request, Response } from "express";
import { rateLimit } from "express-rate-limit";
const isDevEnv = process.env.NODE_ENV?.toUpperCase() === "DEV";

if (isDevEnv) {
    console.log("Skiping the all rate limites");
} else {
    console.log("Applying all rate limites");
}

const devPassHandler = (_req: Request, _res: Response, next: NextFunction) =>
    next();

const authLimit = isDevEnv
    ? devPassHandler
    : rateLimit({
          windowMs: 15 * 60 * 1000, // 15 Minutes
          limit: 10,
      });

const generalLimit = isDevEnv
    ? devPassHandler
    : rateLimit({
          windowMs: 10 * 60 * 1000,
          limit: 500,
      });

const shortUrlLimit = isDevEnv
    ? devPassHandler
    : rateLimit({
          windowMs: 10 * 60 * 1000,
          limit: 10,
      });

export { authLimit, generalLimit, shortUrlLimit };
