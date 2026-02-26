import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { prisma } from "../lib/prisma";
import { sendActivationEmail } from "../lib/mailer";

// helper function
import { getExpiryDate } from "../utils/date";
import { AppError } from "../utils/AppError";
interface RegisterInput {
  username: string;
  email: string;
  password: string;
}

export class AuthService {
  async register({ username, email, password }: RegisterInput) {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw new AppError("User already exists", 409);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // This requires MongoDB Replica Set
    const result = await prisma.$transaction(async (tx) => {
      const createdUser = await tx.user.create({
        data: {
          username,
          email,
          password: hashedPassword,
        },
      });

      const verificationToken = crypto.randomBytes(32).toString("hex");

      await tx.token.create({
        data: {
          token: verificationToken,
          userId: createdUser.id,
          expiresAt: getExpiryDate(1), // 1 day
          type: "ACTIVATE",
        },
      });

      return { user: createdUser, token: verificationToken };
    });

    await sendActivationEmail(result.user.email, result.token);

    return { message: "Registration successful. Please check your email." };
  }

  // login user and return JWT token
  async login(email: string, password: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new AppError("Invalid email or password", 401);

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) throw new AppError("Invalid email or password", 401);

    // jwt secret should be defined in .env and should be a string
    if (!process.env.JWT_SECRET)
      throw new AppError("JWT_SECRET is not defined in environment variables", 500);

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    return { token, user };
  }

  async activate(token: string) {
    const dbToken = await prisma.token.findUnique({ where: { token } });

    if (
      !dbToken ||
      dbToken.expiresAt < new Date() ||
      dbToken.type !== "ACTIVATE"
    ) {
      throw new AppError("Invalid or expired token", 400);
    }

    await prisma.$transaction([
      prisma.user.update({
        where: { id: dbToken.userId },
        data: { isActivated: true },
      }),
      prisma.token.delete({ where: { id: dbToken.id } }),
    ]);

    return { message: "Account activated successfully." };
  }

  async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        email: true,
        isActivated: true,
      },
    });

    if (!user) throw new AppError("User not found", 404);
    return user;
  }
}
