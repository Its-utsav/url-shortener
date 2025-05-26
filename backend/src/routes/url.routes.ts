import { Router } from "express";
import { verifyJWT } from "../middleware/auth.middleware";
import {
    createShortUrl,
    redirectToOriginalUrl,
    deleteShortUrl,
    getAnalytics,
    redirectToProtectedUrl,
    updateShortUrl,
} from "../controllers/url.controller";
import { generalLimit, shortUrlLimit } from "../utils/rateLimiter";

const router = Router();

router.route("/").post(shortUrlLimit, verifyJWT, createShortUrl);

router
    .route("/:shortUrl")
    .get(generalLimit, redirectToOriginalUrl)
    .patch(verifyJWT, updateShortUrl)
    .delete(verifyJWT, deleteShortUrl);

router.route("/password/:shortUrl").post(shortUrlLimit, redirectToProtectedUrl);

router
    .route("/analytics/:shortUrl")
    .get(shortUrlLimit, verifyJWT, getAnalytics);

export default router;
