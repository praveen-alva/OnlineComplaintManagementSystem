const express = require("express");
const bcrypt = require("bcryptjs");

const router = express.Router();

const User = require("../models/user");

// ======================================================
// GET ALL USERS
// GET /api/admin/users
// ======================================================

router.get("/users", async (req, res) => {
  try {
    const users = await User.find({
      type: "user",
    })
      .select("-password")
      .sort({ createdAt: -1 });

    res.status(200).json(users);
  } catch (error) {
    console.error("❌ Get Users Error:", error);

    res.status(500).json({
      message: "Failed to fetch users",
    });
  }
});

// ======================================================
// GET AGENT
// GET /api/admin/agent
// ======================================================

router.get("/agent", async (req, res) => {
  try {
    const agent = await User.findOne({
      type: "agent",
    }).select("-password");

    res.status(200).json(agent);
  } catch (error) {
    console.error("❌ Get Agent Error:", error);

    res.status(500).json({
      message: "Failed to fetch agent",
    });
  }
});

// ======================================================
// CREATE AGENT
// POST /api/admin/agent
// ======================================================

router.post("/agent", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    // Only ONE agent allowed
    const existingAgent = await User.findOne({
      type: "agent",
    });

    if (existingAgent) {
      return res.status(400).json({
        message: "An agent already exists",
      });
    }

    const existingUser = await User.findOne({
      email: email.toLowerCase(),
    });

    if (existingUser) {
      return res.status(400).json({
        message: "Email already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(
      password,
      10
    );

    const agent = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      type: "agent",
      isActive: true,
    });

    res.status(201).json({
      message: "Agent created successfully",
      agent: {
        _id: agent._id,
        name: agent.name,
        email: agent.email,
        type: agent.type,
        isActive: agent.isActive,
      },
    });
  } catch (error) {
    console.error("❌ Create Agent Error:", error);

    res.status(500).json({
      message: "Failed to create agent",
    });
  }
});

// ======================================================
// DISABLE AGENT
// PATCH /api/admin/agent/:id/disable
// ======================================================

router.patch("/agent/:id/disable", async (req, res) => {
  try {
    const agent = await User.findOneAndUpdate(
      {
        _id: req.params.id,
        type: "agent",
      },
      {
        isActive: false,
      },
      {
        new: true,
      }
    ).select("-password");

    if (!agent) {
      return res.status(404).json({
        message: "Agent not found",
      });
    }

    res.status(200).json({
      message: "Agent disabled successfully",
      agent,
    });
  } catch (error) {
    console.error("❌ Disable Agent Error:", error);

    res.status(500).json({
      message: "Failed to disable agent",
    });
  }
});

// ======================================================
// ENABLE AGENT
// PATCH /api/admin/agent/:id/enable
// ======================================================

router.patch("/agent/:id/enable", async (req, res) => {
  try {
    const agent = await User.findOneAndUpdate(
      {
        _id: req.params.id,
        type: "agent",
      },
      {
        isActive: true,
      },
      {
        new: true,
      }
    ).select("-password");

    if (!agent) {
      return res.status(404).json({
        message: "Agent not found",
      });
    }

    res.status(200).json({
      message: "Agent enabled successfully",
      agent,
    });
  } catch (error) {
    console.error("❌ Enable Agent Error:", error);

    res.status(500).json({
      message: "Failed to enable agent",
    });
  }
});

// ======================================================
// DISABLE USER
// PATCH /api/admin/users/:id/disable
// ======================================================

router.patch("/users/:id/disable", async (req, res) => {
  try {
    const user = await User.findOneAndUpdate(
      {
        _id: req.params.id,
        type: "user",
      },
      {
        isActive: false,
      },
      {
        new: true,
      }
    ).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.status(200).json({
      message: "User disabled successfully",
      user,
    });
  } catch (error) {
    console.error("❌ Disable User Error:", error);

    res.status(500).json({
      message: "Failed to disable user",
    });
  }
});

// ======================================================
// ENABLE USER
// PATCH /api/admin/users/:id/enable
// ======================================================

router.patch("/users/:id/enable", async (req, res) => {
  try {
    const user = await User.findOneAndUpdate(
      {
        _id: req.params.id,
        type: "user",
      },
      {
        isActive: true,
      },
      {
        new: true,
      }
    ).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.status(200).json({
      message: "User enabled successfully",
      user,
    });
  } catch (error) {
    console.error("❌ Enable User Error:", error);

    res.status(500).json({
      message: "Failed to enable user",
    });
  }
});

module.exports = router;