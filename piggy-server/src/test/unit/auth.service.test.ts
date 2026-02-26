// import { sendActivationEmail } from "../../lib/mailer";
jest.mock("../../lib/mailer", () => ({
  sendActivationEmail: jest.fn(),
}));
import { prismaMock } from "../mock/prisma";
import { AuthService } from "../../services/auth.service";
import { mockReset } from "jest-mock-extended";
import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import bcrypt from "bcrypt";
// import jwt from "jsonwebtoken";


const authService = new AuthService();

beforeEach(() => {
  mockReset(prismaMock);
});
describe("AuthService", () => {
  // group tests for the register method
  describe("register", () => {
    it("should register a new user", async () => {
      prismaMock.user.findUnique.mockResolvedValue(null); // No existing user

      // mock user response for create
      const mockuser = {
        id: "user-id-123",
        username: "testuser",
        email: "testuser@example.com",
        password: "hashedpassword123",
        isActivated: false,
      };
      
      prismaMock.user.create.mockResolvedValue(mockuser);
      prismaMock.token.create.mockResolvedValue({
        id: "activation-id-123",
        token: "activation-token-123",
        userId: "user-id-123",
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
        type: "ACTIVATE",
      });
      prismaMock.$transaction.mockImplementation(async (callback: any) => {
        return callback(prismaMock); // pass prismaMock so tx works inside the service
      });

      const result = await authService.register({
        username: "testuser",
        email: "testuser@example.com",
        password: "password123",
      });

      expect(result.message).toBe(
        "Registration successful. Please check your email.",
      );
      expect(prismaMock.$transaction).toHaveBeenCalled();
    });

    it("should throw an error if user already exists", async () => {
      prismaMock.user.findUnique.mockResolvedValue({
        id: "user-id-123",
        email: "testuser@example.com",
        username: "testuser",
        isActivated: true,
        password: "password123",
      });

      await expect(
        authService.register({
          username: "testuser",
          password: "password123",
          email: "testuser@example.com",
        }),
      ).rejects.toThrow("User already exists");
    });
  });

  //   login test

  describe("login", () => {
    it("should return a token for valid credentials", async () => {
      const hashedPassword = await bcrypt.hash("password123", 10);
      const mockUser = {
        id: "123",
        email: "test@test.com",
        password: hashedPassword,
      };

      prismaMock.user.findUnique.mockResolvedValue(mockUser as any);
      process.env.JWT_SECRET = "test-secret";
      const result = await authService.login("test@test.com", "password123");

      expect(result).toHaveProperty("token");
      expect(result.user.id).toBe("123");
    });

    it("should throw an error if password is incorrect", async () => {
      const hashedPassword = await bcrypt.hash("real-password", 10);
      prismaMock.user.findUnique.mockResolvedValue({
        password: hashedPassword,
      } as any);
      await expect(
        authService.login("test@test.com", "wrong-password"),
      ).rejects.toThrow("Invalid email or password");
    });
  });

  it("Should throw an error if email does not exist", async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);

    await expect(
      authService.login("test@test.com", "wrong-password"),
    ).rejects.toThrow("Invalid email or password");
  });
});
