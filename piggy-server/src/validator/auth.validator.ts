import {z} from "zod";

export const userSchema = z.object({
    username: z.string().min(2, { error: "Username must be at least 2 characters long" }).max(100, { error: "Username must be at most 100 characters long" }),
    email: z.email({ error: "Invalid email address" }).max(100, { error: "Email must be at most 100 characters long" }),
    password: z.string().min(6, { error: "Password must be at least 6 characters long" }).max(100, { error: "Password must be at most 100 characters long" }),
})

export const activateSchema = z.object({
    token: z.string().min(1, { error: "Token is required" }),
})

