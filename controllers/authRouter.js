import express from 'express';
import { userModel } from '../db.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from'dotenv';
import crypto from "crypto";
import passport from "../config/passport.js";
const router = express.Router();
dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET;
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);
router.get(
  "/google/callback",
  passport.authenticate("google", { session: false, failureRedirect: "/login" }),
  async (req, res) => {
    const token = jwt.sign(
      { id: req.user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(200).json({
      message: "Google login successful",
      token,
    });
  }
);
router.post('/signup',async (req,res)=>{
    const email = req.body.email;
    const password = req.body.password;
    const hashedPasword = await bcrypt.hash(password,10);
    const existingUser = await userModel.findOne({email:email});
    if(existingUser){
        return res.status(400).json({
            message:"user already exists"
        })
    }
    const newUser = await userModel.create({email:email,password:hashedPasword});
    const token = jwt.sign({id:newUser._id},JWT_SECRET,{expiresIn:"7d"});
    res.status(201).json({
        message:"user registered successfully",
        token:token
    });

}) ;
router.post('/login',async (req,res) => {
    const {email,password} = req.body;
    const existingUser = await userModel.findOne({email:email});
    if(!existingUser){
        return res.status(400).json({
            message:"Invalid credentials"
        })
    }
    const isPasswordValid = await bcrypt.compare(password,existingUser.password);
    if(!isPasswordValid){
        return res.status(400).json({
            message:"Invalide credentials"
        })
    }
    const token  = jwt.sign({id:existingUser._id},JWT_SECRET,{expiresIn:"7d"});
    res.status(200).json({
        message:"login successful",
        token:token
    })

});
router.post('/logout', (req, res) => {
    res.status(200).json({
        message: "Logged out successfully"
    });
});


router.post('/forgot-password', async (req, res) => {
    const { email } = req.body;
    const user = await userModel.findOne({ email });
    if (!user) {
        return res.status(400).json({
            message: "User not found"
        });
    }
    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");
    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = Date.now() + 15 * 60 * 1000; 
    await user.save();
    const resetUrl = `http://localhost:3000/reset-password/${resetToken}`;
    res.status(200).json({
        message: "Password reset link generated",
        resetUrl 
    });
});
router.post('/reset-password/:token', async (req, res) => {
    const { token } = req.params;
    const { password } = req.body;
    const hashedToken = crypto
        .createHash("sha256")
        .update(token)
        .digest("hex");
    const user = await userModel.findOne({
        resetPasswordToken: hashedToken,
        resetPasswordExpires: { $gt: Date.now() }
    });
    if (!user) {
        return res.status(400).json({
            message: "Invalid or expired token"
        });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();
    res.status(200).json({
        message: "Password reset successful"
    });
});
export default router;