import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { 
    changeCurrentPassword,
    getCurrentUser,
    loginUser, 
    logoutUser, 
    refreshAccessToken, 
    registerUser, 
    updateAccountDetails,
    updateUserAvatar
} from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/register").post(
    upload.single("avatar"),
    registerUser
);

router.route("/login").post(loginUser);

// secured routes
router.route("/logout").post(verifyJWT, logoutUser);

router.route("/refreshToken").post(verifyJWT, refreshAccessToken);

router.route("/changePassword").patch(verifyJWT, changeCurrentPassword);

router.route("/getCurrentUser").get(verifyJWT, getCurrentUser);

router.route("/updateAccountDetails").patch(verifyJWT, updateAccountDetails);

router.route("/updateUserAvatar").patch(
    verifyJWT,
    upload.single("avatar"),
    updateUserAvatar
);

export default router;