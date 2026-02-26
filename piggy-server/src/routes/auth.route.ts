import express from "express";
import { activateUser, getCurrentUser, loginUser, registerUser } from "../controllers/auth.controller";
import {  isAuthenticated } from "../middlewares/isAuthenticated";
import { validate } from "../middlewares/validator";
import { loginSchema, registerSchema, activateSchema } from "../validator/auth.validator";
const router = express.Router();

router.post("/register", validate(registerSchema), registerUser);
router.post("/login", validate(loginSchema), loginUser);
router.get("/activate", validate(activateSchema), activateUser);
router.get("/me", isAuthenticated, getCurrentUser);

export default router;
