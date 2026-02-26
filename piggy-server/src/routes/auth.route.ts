import express from "express";
import { activateUser, getCurrentUser, loginUser, registerUser } from "../controllers/auth.controller";
import {  isAuthenticated } from "../middlewares/isAuthenticated";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/activate", activateUser);
router.get("/me", isAuthenticated, getCurrentUser);

export default router;
