const express = require("express");
const router = express.Router();

const { GoogleGenAI } = require("@google/genai");



const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

// =====================================================
// GEMINI CHAT
// POST /api/chat
// =====================================================

router.post("/", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({
        message: "Message is required",
      });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: `
You are a helpful AI assistant for an Online Complaint Management System.

Help users with:
- Submitting complaints
- Complaint categories
- Complaint priority
- Checking complaint status
- Understanding Pending, In Progress and Resolved
- General questions about the complaint management system

Give short, simple and friendly answers.

User question:
${message}
      `,
    });

    res.status(200).json({
      reply: response.text,
    });

  } catch (error) {
    console.error("❌ Gemini Chat Error:", error);

    res.status(500).json({
      message: "Gemini AI failed",
      error: error.message,
    });
  }
});

module.exports = router;