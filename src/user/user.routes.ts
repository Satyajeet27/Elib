import { Router } from "express";
import { createUser, loginUser } from "./user.controller";

const router = Router();

//creating user
router.post("/register", createUser);
router.post("/login", loginUser);

export default router;
