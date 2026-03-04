import express from 'express';
import cors from 'cors';
const app = express();
const PORT = 3000;
import dotenv from "dotenv";
import session from "express-session";
import passport from "./config/passport.js";
import authRouter from './controllers/authRouter.js';
dotenv.config();

app.use(cors());
app.use(express.json());
app.use(
  session({
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());
app.use("/api/auth",authRouter);
app.listen(process.env.PORT || 3000,()=>{
    console.log(`Server is running on port ${PORT}`);
});