
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import crypto from 'crypto';
import {prisma} from '../lib/prisma';
import { sendActivationEmail } from "../lib/mailer";
interface RegisterInput {
    username: string;
    email: string;
    password: string;
}



export class AuthService {
    // register a new user
    async register({ username, email, password }: RegisterInput) {
        // check if the user already exists
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            throw new Error("User already exists");
        }
        // hash the password
        const hashedPassword = await bcrypt.hash(password, 10);
        // create the user
        const user = await prisma.user.create({
            data: {
                username,
                email,
                password: hashedPassword,
            },
        });
        // Create User and Verification Token in a Transaction
        const newUser = await prisma.$transaction(async (transacton) => {
            const verificationToken = crypto.randomBytes(32).toString('hex');
              const createdUser = await transacton.user.create({
                data: {
                    username,
                    email,
                    password: hashedPassword,
                },
            });

            // generate a unique verification token
            await transacton.token.create({
                data:{
                    token: verificationToken,
                    userId: createdUser.id,
                    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // Token expires in 24 hours
                    type: "ACTIVATE",
                }
            });
            return { user: createdUser, token: verificationToken };
            
        });
       
        // send activation email
        await sendActivationEmail(newUser.user.email, newUser.token);
        return { message: "Registration successful. Please check your email to activate your account." };

    }

    // activate user account
    async activate(token: string) {
        // find the token in the database
        const dbToken = await prisma.token.findUnique({ where: { token } });
        // if token is not found or expired, throw an error
        if (!dbToken || dbToken.expiresAt < new Date() || dbToken.type !== "ACTIVATE") {
            throw new Error("Invalid or expired token");
        }
        // activate the user account 
        await prisma.user.update({
            where: { id: dbToken.userId },
            data: { isActivated: true },
        })
        // delete the token after activation
        await prisma.token.delete({ where: { id: dbToken.id } });
        return { message: "Account activated successfully. You can now log in." };
    }
}
