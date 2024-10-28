import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    require: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  email: {
    type: String, 
    unique:true, 
    require: true,
    index: true,
    trim: true
  },
  password: {
    type: String,
    require: [true, "Password is required"]
  },
  fullName: {
    type: String,
    require: true,
    trim: true
  },
  department: {
    type: String,
    require: true,
    lowercase: true,
    trim: true
  },
  mobile: {
    type: String,
    require: true
  },
  avatar: {
    type: String,
    require: true
  },
  refreshToken: {
    type: String,
  }
}, {timestamps: true});

userSchema.pre("save", async function(next) {
  if(!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.isPasswordCorrect = async function(password) {
  return await bcrypt.compare(password, this.password);
}

userSchema.methods.generateAccessToken = function() {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      username: this.username,
      fullName: this.fullName
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY
    }
  );
}

userSchema.methods.generateRefreshToken = function() {
  return jwt.sign(
    {
      _id: this._id
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY
    }
  );
}

export const User = mongoose.model("User", userSchema);