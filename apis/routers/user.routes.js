import { Router } from "express";
const router = Router();

import { GetAllUsers, 
    GetUserById, 
    GetCurrentUser, 
    CreateUser,  
    UpdateUserById,
    DeleteUserById
} from "../controllers/user.controllers";

router.get("/", GetAllUsers);
router.get("/:id", GetUserById);
router.get("/me", GetCurrentUser);
router.post("/", CreateUser);
router.put("/:id", UpdateUserById);
router.delete("/:id", DeleteUserById);

export default router;