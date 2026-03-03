import express from 'express';
import cors from 'cors';
const app = express();
const PORT = 3000;
import dotenv from "dotenv";
import authRouter from './controllers/authRouter.js';
dotenv.config();

app.use(cors());
app.use(express.json());
app.use("/api/auth",authRouter);
app.listen(process.env.PORT || 3000,()=>{
    console.log(`Server is running on port ${PORT}`);
});