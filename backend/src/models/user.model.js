import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "UserName is Required"],
      unique: true,
      trim: true,
      lowercase: true,
    },
    email: {
      type: String,
      required: [true, "Email is Required"],
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    avatar: {
      type: {
        url: String,
        public_id: String,
      },
      default: { url: '', public_id: '' },
    },
    coverImage: {
      type: {
        url: String,
        public_id: String,
      },
      default: { url: '', public_id: '' },
    },
    WatchHistory: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Video",
      },
    ],
    refreshToken: {
      type: String,
    },
    authProvider: {
      type: String,
      enum: ['local', 'github', 'google'],
      default: 'local',
    },
    providerId: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

// Compound index to prevent duplicate OAuth accounts (only for OAuth users with providerId)
userSchema.index(
  { authProvider: 1, providerId: 1 },
  {
    unique: true,
    partialFilterExpression: { providerId: { $type: "string", $ne: "" } },
  }
);

//  Hash password before saving the user to DB
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  if (!this.password) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

//  We can make custom methods
userSchema.methods.isPasswordCorrect = async function (password) {
  if (!this.password) return false;
  return await bcrypt.compare(password, this.password);
};

userSchema.methods.GenerateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      username: this.username,
      fullName: this.fullName,
    },
    process.env.JWT_ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRY,
    }
  );
};


userSchema.methods.GenerateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.JWT_REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.JWT_REFRESH_TOKEN_EXPIRY,
    }
  );
};
export const User = mongoose.model("User", userSchema);
