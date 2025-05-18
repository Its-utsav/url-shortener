import { Router } from "express";
import {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    deleteUser,
    getInfoOfUser,
} from "../controllers/user.controller";
import { verifyJWT } from "../middleware/auth.middleware";

const router = Router();

router.route("/register").post(registerUser);
router.route("/login").post(loginUser);

router.route("/logout").post(verifyJWT, logoutUser);
router.route("/refreshToken").post(verifyJWT, refreshAccessToken);
router.route("/delete").post(verifyJWT, deleteUser);
router.route("/me").get(verifyJWT, getInfoOfUser);
export default router;
