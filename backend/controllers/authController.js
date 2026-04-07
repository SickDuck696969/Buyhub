const User = require('../schemas/User');
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const path = require("path");

const privateKey = fs.readFileSync(path.join(__dirname, "../keys/private.key"));
const publicKey = fs.readFileSync(path.join(__dirname, "../keys/public.key"));

const sanitizeUser = (user) => {
  const userSafe = user.toObject();
  delete userSafe.password;
  return userSafe;
};

const findManagedUser = async (userId) => {
  const user = await User.findById(userId);

  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  if (user.role !== "user") {
    const error = new Error("Only user accounts can be managed here");
    error.statusCode = 403;
    throw error;
  }

  return user;
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.status) {
      return res.status(403).json({ message: "User is disabled" });
    }

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.status(401).json({ message: "Wrong password" });
    }

    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        role: user.role
      },
      privateKey,
      {
        algorithm: "RS256",
        expiresIn: "1h"
      }
    );

    user.loginCount += 1;
    await user.save();

    res.json({
      message: "Login successful",
      token,
      loginCount: user.loginCount
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.register = async (req, res) => {
  try {
    const { username, password, email, fullName, role } = req.body;

    const existingUser = await User.findOne({
      $or: [{ username }, { email }]
    });

    if (existingUser) {
      return res.status(400).json({
        message: "Username or email already exists"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      username,
      password: hashedPassword,
      email,
      fullName,
      role,
      status: true,
    });

    await newUser.save();

    res.status(201).json({
      message: "User registered successfully",
      data: sanitizeUser(newUser)
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select("-password")

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    res.json({
      message: "User profile",
      data: user
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    const user = await User.findById(req.user.id);

    const match = await bcrypt.compare(oldPassword, user.password);

    if (!match) {
      return res.status(401).json({
        message: "Old password incorrect"
      });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({
      message: "Password changed successfully"
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

exports.enableUser = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        message: "userId is required"
      });
    }

    const user = await findManagedUser(userId);
    user.status = true;
    await user.save();

    res.json({
      message: "User enabled successfully",
      data: sanitizeUser(user)
    });

  } catch (error) {
    res.status(error.statusCode || 500).json({
      message: error.message
    });
  }
};

exports.disableUser = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        message: "userId is required"
      });
    }

    const user = await findManagedUser(userId);
    user.status = false;
    await user.save();

    res.json({
      message: "User disabled successfully",
      data: sanitizeUser(user)
    });

  } catch (error) {
    res.status(error.statusCode || 500).json({
      message: error.message
    });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 0;
    const search = String(req.query.search || "").trim();

    const query = {
      role: "user"
    };

    if (search) {
      query.$or = [
        { username: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { fullName: { $regex: search, $options: "i" } }
      ];
    }

    let userQuery = User.find(query)
      .select("-password")
      .sort({ createdAt: -1 });

    if (limit > 0) {
      userQuery = userQuery
        .skip((page - 1) * limit)
        .limit(limit);
    }

    const users = await userQuery;
    const total = await User.countDocuments(query);

    res.json({
      message: "All user accounts",
      currentPage: limit > 0 ? page : 1,
      totalPages: limit > 0 ? Math.ceil(total / limit) : 1,
      totalUsers: total,
      data: users.map(sanitizeUser)
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};
