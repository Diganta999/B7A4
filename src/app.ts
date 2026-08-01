import express, { Application } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import Routes from "./routes/route";

const app:Application = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
     origin: true,
     credentials: true,
}));
app.use(cookieParser());
app.use("/api", Routes);

app.get("/", (_req, res) => {
    res.send("Hello, World!");
});







export default app;