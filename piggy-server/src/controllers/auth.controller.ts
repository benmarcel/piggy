import { AuthService } from "../services/auth.service";
import type { Request, Response } from "express";
import type { RegisterInput, LoginInput, ActivateInput } from "../validator/auth.validator";
const authService = new AuthService();

//   Note: errors are handled by the error handling middleware, so we don't need to catch them here. If any error occurs, it will be passed to the error handler. and since we are using zod for validation, if the input is invalid, it will throw a zod error which will also be handled by the error handler. remember  if you are using a lower version (v4) of express use a try-catch block and call next(err) in the catch block to pass the error to the error handler.
export const registerUser = async (req: Request, res: Response) => {
  const { username, email, password } = req.body as RegisterInput;
  //   middleware handles validation
  
  // call the register method of the auth service
  const result = await authService.register({username, password, email});
  // send response to the client
  res.status(201).json({
    success: true,
    ...result,
  });
};

export const activateUser = async (req: Request, res: Response) => {
  const { token } = req.query as ActivateInput;
  // middleware handles validation
 if (typeof token !== "string") {}
  // call the activate method of the auth service
  const result = await authService.activate(token);
  // send response to the client
  res.status(200).json({
    success: true,
    ...result,
  });
};

// login user and return JWT token
export const loginUser = async (req: Request, res: Response) => {
  const { email, password } = req.body as LoginInput;
 
  // call the login method of the auth service
  const result = await authService.login(
    email,
    password,
  );
  // send response to the client
  res.status(200).json({
    success: true,
    ...result,
  });
};

// get current user details
export const getCurrentUser = async (req: Request, res: Response) => {
  // the userId is set in the auth middleware and is available in the request object
  const userId = req.user!.userId;
  
  // call the getProfile method of the auth service
  const user = await authService.getProfile(userId);
  // send response to the client
  res.status(200).json({
    success: true,
    user,
  });
}
