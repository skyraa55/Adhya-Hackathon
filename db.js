import mongoose from "mongoose";
import dotenv from 'dotenv';
dotenv.config();
const MONGO_URL = process.env.MONGO_URL ;
mongoose.connect(MONGO_URL);
const userSchema =new mongoose.Schema({
    email : {type:String ,required:true,unique:true},
    password : {type:String,required:true},
    
},{timestamps:true});
export const userModel = new mongoose.model("user",userSchema);