import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from '../models/user.model.js';
import { deleteOnCloudinary, uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";

const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return {accessToken, refreshToken};

    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating tokens");
    }
}

const registerUser = asyncHandler( async (req, res) => {
    // get user details from frontend
    const { username, email, fullName, password, department } = req.body;

    // validation - not empty
    if(
        [username, email, fullName, password, department].some((field) => field?.trim() === "")
    ){
        throw new ApiError(400, "All fields are required");
    }

    // check if user already exists: username, email
    const existingUser = await User.findOne({ 
        $or: [{ username }, { email }]
    });
    if(existingUser) {
        throw new ApiError(409, "Username or Email already exists");
    }

    // check for avatar
    if(!req.file) {
        throw new ApiError(400, "Avatar is required");
    }

    // upload it from buffer directly to cloudinary, avatar check
    const avatar = await uploadOnCloudinary(req.file.buffer);
    if(!avatar) {
        throw new ApiError(500, "Failed to upload avatar");
    }

    // create user object - create entry in DB
    const user = await User.create({
        username: username.toLowerCase(),
        email,
        password,
        fullName,
        department: department.toLowerCase(),
        avatar: avatar.url
    });

    // remove password and refreshToken fields from response
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );

    // check for user creation
    if(!createdUser){
        throw new ApiError(500, "Failed to register the user");
    }

    // return res
    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered successfully")
    );
});

const loginUser = asyncHandler( async (req, res) => {
    // req body -> data
    const { username, email, password } = req.body;
    
    // validate username or email
    if(!(username || email)) {
        throw new ApiError(400, "Username or Email is required");
    }

    // find the user
    const user = await User.findOne({ 
        $or: [{ username }, { email }]
    });
    if(!user) {
        throw new ApiError(404, "User does not exists");
    }

    // password check
    const isPasswordValid = await user.isPasswordCorrect(password);
    if(!isPasswordValid) {
        throw new ApiError(401, "Invalid user credentials");
    }

    // access and refresh tokens
    const {accessToken, refreshToken} = await generateAccessAndRefreshTokens(user._id);

    // send cookies and success res
    const loggedInUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );
    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(
            200, 
            {
                user: loggedInUser, accessToken, refreshToken
            }, 
            "User logged in successfully"
        )
    );
});

const logoutUser = asyncHandler( async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined
            }
        },
        {
            new: true
        }
    );

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(
        new ApiResponse(200, {}, "User logged out successfully")
    );
});

const refreshAccessToken = asyncHandler( async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

    if(!incomingRefreshToken) {
        throw new ApiError(401, "Unauthorized request");
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken, 
            process.env.REFRESH_TOKEN_SECRET,
        );
    
        const user = await User.findById(decodedToken?._id);
        if(!user) {
            throw new ApiError(401, "Invalid token");
        }
    
        if(user?.refreshToken !== incomingRefreshToken) {
            throw new ApiError(401, "Refresh token expired or used");
        }
    
        const options = {
            httpOnly: true,
            secure: true
        }
        const {accessToken, newRefreshToken} = await generateAccessAndRefreshTokens();
    
        res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", newRefreshToken, options)
        .json(
            new ApiResponse(
                200, 
                {accessToken, newRefreshToken},
                "Tokens refreshed successfully"
            )
        );
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token");
    }
});

const changeCurrentPassword = asyncHandler( async (req, res) => {
    const {oldPassword, newPassword} = req.body;

    const user = await User.findById(req.user?._id);
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

    if(!isPasswordCorrect) {
        throw new ApiError(400, "Old password is incorrect");
    }

    user.password = newPassword
    await user.save({validateBeforeSave: false});

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            {},
            "Password changed successfully"
        )
    );
});

const getCurrentUser = asyncHandler( async (req, res) => {
    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            req.user,
            "Current user retrieved successfully"
        )
    );
});

const updateAccountDetails = asyncHandler( async (req, res) => {
    const {fullName, email, mobile} = req.body;

    if(!fullName || !email || !mobile) {
        throw new ApiError(400, "All fields are required");
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                fullName,
                email,
                mobile
            }
        },
        {
            new: true
        }
    ).select("-password");

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            user,
            "Account details updated successfully"
        )
    );
});

const updateUserAvatar = asyncHandler( async (req, res) => {

    if(!req.file) {
        throw new ApiError(400, "Avatar file is required");
    }

    const avatar = await uploadOnCloudinary(req.file.buffer);

    if(!avatar.url) {
        throw new ApiError(400, "Error while uploading avatar");
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                avatar: avatar.url
            }
        },
        {
            new: true
        }
    ).select("-password");

    const publicIdOfPrevAvatar = req.user?.avatar;
    const deleteOldAvatar = await deleteOnCloudinary(publicIdOfPrevAvatar);

    if(!deleteOldAvatar) {
        throw new ApiError(500, "Error while deleting old avatar");
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            user,
            "Avatar updated successfully",
        )
    );
});

export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar
}