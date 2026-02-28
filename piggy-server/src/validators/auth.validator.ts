import {z} from "zod";

export const registerSchema = z.object({
    username: z.string().min(2, { error: "Username must be at least 2 characters long" }).max(100, { error: "Username must be at most 100 characters long" }),
    email: z.email({ error: "Invalid email address" }).max(100, { error: "Email must be at most 100 characters long" }),
    password: z.string().min(6, { error: "Password must be at least 6 characters long" }).max(100, { error: "Password must be at most 100 characters long" }),
})
// infer the type of the user schema
export type RegisterInput = z.infer<typeof registerSchema>

export const loginSchema = z.object({
    email: z.email({ error: "Invalid email address" }).max(100, { error: "Email must be at most 100 characters long" }),
    password: z.string().min(6, { error: "Password must be at least 6 characters long" }).max(100, { error: "Password must be at most 100 characters long" }),
})
export type LoginInput = z.infer<typeof loginSchema>

export const activateSchema = z.object({
    token: z.string().min(1, { error: "Token is required" }),
})
export type ActivateInput = z.infer<typeof activateSchema>

