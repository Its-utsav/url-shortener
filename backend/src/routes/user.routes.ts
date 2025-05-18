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
router.use(verifyJWT);
router.route("/logout").post(logoutUser);
router.route("/refreshToken").post(refreshAccessToken);
router.route("/delete").post(deleteUser);
router.route("/me").get(getInfoOfUser);
export default router;
