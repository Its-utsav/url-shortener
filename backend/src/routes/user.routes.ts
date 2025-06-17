import { Router } from "express";
import {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    deleteUser,
    getInfoOfUser,
    getUserURLs,
} from "../controllers/user.controller";
import { verifyJWT } from "../middleware/auth.middleware";
import { authLimit } from "../utils/rateLimiter";

const router = Router();

router.route("/register").post(authLimit, registerUser);
router.route("/login").post(authLimit, loginUser);

router.route("/logout").post(verifyJWT, logoutUser);
router.route("/refreshToken").post(authLimit, verifyJWT, refreshAccessToken);
router.route("/delete").post(verifyJWT, deleteUser);
router.route("/me").get(verifyJWT, getInfoOfUser);
router.route("/urls").get(verifyJWT, getUserURLs);

export default router;
