import express, { urlencoded } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";



const app = express();

//* Basic Configurations
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"))

//* CORS  Configurations
app.use(cors({
  origin: process.env.CORS_ORIGIN?.split(",") || "http://localhost:5173",
  credential: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS",],
  allowedHeaders: ["Authorization", "Content-Type"]
}))
//* Cookie Parser
app.use(cookieParser())


//* import the routes

import healthcheckRouter from "./routes/healthcheck.routes.js";
import authRouter from "./routes/auth.routes.js";
app.use("/api/v1/healthcheck", healthcheckRouter);
app.use("/api/v1/auth", authRouter)




//* Server Listeaner
app.get("/", (req, res) => {
  res.send("Wecome to basecamp!!!");
})

export default app;