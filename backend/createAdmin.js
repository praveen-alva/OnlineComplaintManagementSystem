require("dotenv").config();

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const User = require("./models/user");

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const existingAdmin = await User.findOne({
      type: "admin",
    });

    if (existingAdmin) {
      console.log("Admin already exists");
      process.exit();
    }

    const hashedPassword = await bcrypt.hash(
      "Admin@123",
      10
    );

    const admin = await User.create({
      name: "Admin",
      email: "admin@resolvenow.com",
      password: hashedPassword,
      type: "admin",
      isActive: true,
    });

    console.log("✅ Admin created:", admin.email);

    process.exit();
  } catch (error) {
    console.error("❌ Admin creation error:", error);
    process.exit(1);
  }
};

createAdmin();