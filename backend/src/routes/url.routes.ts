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

const router = Router();

router.route("/").post(verifyJWT, createShortUrl);

router
    .route("/:shortUrl")
    .get(redirectToOriginalUrl)
    .patch(verifyJWT, updateShortUrl)
    .delete(verifyJWT, deleteShortUrl);

router.route("/password/:shortUrl").post(redirectToProtectedUrl);

router.route("/analytics/:shortUrl").get(verifyJWT, getAnalytics);

export default router;
