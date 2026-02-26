import express from "express";
const app = express();
import authRoutes from "./routes/auth.route";
import { errorHandler } from "./middlewares/errorHandler";
import cors from "cors";

// enable CORS for all routes
app.use(cors());
// middlewares
app.use(express.json());

// routes
app.use("/api/auth", authRoutes);
// home route
app.get("/", (req, res) => {
  res.send("Welcome to the Piggy API!");
});

// error handling middleware (should be the last middleware)
app.use(errorHandler);

export default app;