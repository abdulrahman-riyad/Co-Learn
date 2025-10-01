import { Router } from "express";
import auth from "../../middleware/authMiddleware.ts"
const router = Router();

import {
    Login,
    RegisterNewUser,
    RefreshAccessToken,
    Logout
} from "../../controllers/v1/auth.controllers.ts"

router.post("/register", RegisterNewUser)
router.post("/login", Login)
router.get("/refresh", RefreshAccessToken)
router.post("/logout", auth, Logout)
export default router;