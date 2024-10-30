import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

// middlewares
app.use(cors({
    credentials: true,
    origin: process.env.CORS_ORIGIN
}));
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

// routes
import userRouter from "./routes/user.routes.js";
import newsRouter from "./routes/news.routes.js";
import emailRouter from "./routes/email.routes.js";

app.use("/api/v1/users", userRouter); // user login, registration and info endpoints
app.use("/api/v1/news", newsRouter); // news endpoint
app.use("/api/v1/email", emailRouter); // email endpoint for github actions cron

export { app };