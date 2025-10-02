import { Router } from "express";
import auth from "../../middleware/authMiddleware.ts"
const router = Router();

import {
  GetAllUsers,
  GetUserById,
  GetCurrentUser,
  CreateUser,
  UpdateUserById,
  DeleteUserById,
} from "../../controllers/v1/user.controllers.ts";

router.get("/", GetAllUsers);
router.get("/me", auth, GetCurrentUser);
router.get("/:id", GetUserById);
router.post("/", CreateUser);
router.put("/:id", UpdateUserById);
router.delete("/:id", DeleteUserById);

export default router;
