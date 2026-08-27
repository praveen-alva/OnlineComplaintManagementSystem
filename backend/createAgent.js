require("dotenv").config();

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const User = require("./models/user");

const createAgent = async () => {
  try {
    // Connect MongoDB
    await mongoose.connect(process.env.MONGO_URI);

    console.log("✅ MongoDB connected");

    // Check whether agent already exists
    const existingAgent = await User.findOne({
      type: "agent",
    });

    if (existingAgent) {
      console.log("⚠️ Agent already exists");
      console.log("Email:", existingAgent.email);

      await mongoose.disconnect();
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(
      "Agent@123",
      10
    );

    // Create ONE agent
    const agent = new User({
      name: "ResolveNow Agent",
      email: "agent@resolvenow.com",
      password: hashedPassword,
      type: "agent",
    });

    await agent.save();

    console.log("=================================");
    console.log("✅ Agent created successfully");
    console.log("Email: agent@resolvenow.com");
    console.log("Password: Agent@123");
    console.log("=================================");

    await mongoose.disconnect();

  } catch (error) {
    console.error("❌ Agent creation failed:");
    console.error(error);

    await mongoose.disconnect();
  }
};

createAgent();