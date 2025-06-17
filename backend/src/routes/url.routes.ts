import { Router } from "express";
import { verifyJWT } from "../middleware/auth.middleware";
import {
    createShortUrl,
    redirectToOriginalUrl,
    deleteShortUrl,
    getAnalytics,
    redirectToProtectedUrl,
    updateShortUrl,
    getUrlInfo,
} from "../controllers/url.controller";
import { generalLimit, shortUrlLimit } from "../utils/rateLimiter";

const router = Router();

router.route("/").post(shortUrlLimit, verifyJWT, createShortUrl);

router
    .route("/:shortUrl")
    .get(generalLimit, getUrlInfo)
    .patch(verifyJWT, updateShortUrl)
    .delete(verifyJWT, deleteShortUrl);

router.route("/r/:shortUrl").get(generalLimit, redirectToOriginalUrl);

router.route("/password/:shortUrl").post(shortUrlLimit, redirectToProtectedUrl);

router
    .route("/analytics/:shortUrl")
    .get(shortUrlLimit, verifyJWT, getAnalytics);

export default router;
