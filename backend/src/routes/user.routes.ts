import { Router } from "express";
import {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    deleteUser,
} from "../controllers/user.controller";
import { verifyJWT } from "../middleware/auth.middleware";

const router = Router();

router.route("/register").post(registerUser);
router.route("/login").post(loginUser);
router.route("/logout").post(verifyJWT, logoutUser);
router.route("/refreshToken").post(verifyJWT, refreshAccessToken);
router.route("/delete").post(verifyJWT, deleteUser);

export default router;
