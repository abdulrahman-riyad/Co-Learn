import { Router } from "express";
import auth from "../../middleware/authMiddleware"
const router = Router();

import {
  GetAllUsers,
  GetUserById,
  GetCurrentUser,
  CreateUser,
  UpdateUserById,
  DeleteUserById,
} from "../../controllers/v1/user.controllers.js";

router.get("/", GetAllUsers);
router.get("/:id", GetUserById);
router.get("/me", auth, GetCurrentUser);
router.post("/", CreateUser);
router.put("/:id", UpdateUserById);
router.delete("/:id", DeleteUserById);

export default router;
