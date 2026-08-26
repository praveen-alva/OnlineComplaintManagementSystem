const express = require("express");
const router = express.Router();

const Complaint = require("../models/complaint");
// const Message = require("../models/message");

// ======================================================
// SUBMIT COMPLAINT
// POST /api/complaints/submit
// ======================================================

router.post("/submit", async (req, res) => {
  try {
    const {
      title,
      category,
      priority,
      description,
      location,
      name,
      email,
      attachment,
    } = req.body;

    if (!title || !category || !priority || !description || !email) {
      return res.status(400).json({
        message: "Required fields are missing",
      });
    }

    const newComplaint = new Complaint({
      title,
      category,
      priority,
      description,
      location,
      status: "Pending",
      date: new Date().toLocaleDateString(),
      name,
      email,
      attachments: attachment
        ? { name: attachment }
        : undefined,
    });

    const savedComplaint = await newComplaint.save();

    // Socket.io
    const io = req.app.get("io");

    if (io) {
      io.emit("newComplaint", savedComplaint);
    }

    res.status(201).json({
      message: "Complaint submitted successfully",
      complaint: savedComplaint,
    });
  } catch (error) {
    console.error("❌ Submit Complaint Error:", error);

    res.status(500).json({
      message: "Failed to submit complaint",
      error: error.message,
    });
  }
});

// ======================================================
// GET ALL COMPLAINTS
// Used by Agent Dashboard
// GET /api/complaints
// ======================================================

router.get("/", async (req, res) => {
  try {
    const complaints = await Complaint.find().sort({
      createdAt: -1,
    });

    res.status(200).json(complaints);
  } catch (error) {
    console.error("❌ Fetch Complaints Error:", error);

    res.status(500).json({
      message: "Error fetching complaints",
      error: error.message,
    });
  }
});
// ======================================================
// DELETE COMPLAINT
// DELETE /api/complaints/:id
// ======================================================

router.delete("/:id", async (req, res) => {
  try {
    const complaint = await Complaint.findByIdAndDelete(
      req.params.id
    );

    if (!complaint) {
      return res.status(404).json({
        message: "Complaint not found",
      });
    }

    // Real-time delete
    const io = req.app.get("io");

    if (io) {
      io.emit("complaintDeleted", {
        _id: complaint._id,
      });
    }

    res.status(200).json({
      message: "Complaint deleted successfully",
    });
  } catch (error) {
    console.error("❌ Delete Complaint Error:", error);

    res.status(500).json({
      message: "Failed to delete complaint",
      error: error.message,
    });
  }
});

// ======================================================
// GET USER COMPLAINTS
// GET /api/complaints/my/:email
// ======================================================

router.get("/my/:email", async (req, res) => {
  try {
    const email = decodeURIComponent(req.params.email);

    const complaints = await Complaint.find({
      email: email,
    }).sort({
      createdAt: -1,
    });

    res.status(200).json(complaints);
  } catch (error) {
    console.error("❌ Fetch User Complaints Error:", error);

    res.status(500).json({
      message: "Failed to fetch user complaints",
      error: error.message,
    });
  }
});

// ======================================================
// UPDATE COMPLAINT STATUS
// PATCH /api/complaints/:id
// ======================================================

router.patch("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowedStatuses = [
      "Pending",
      "In Progress",
      "Resolved",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid complaint status",
      });
    }

    const complaint = await Complaint.findByIdAndUpdate(
      id,
      { status },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!complaint) {
      return res.status(404).json({
        message: "Complaint not found",
      });
    }

    console.log(
      `✅ Complaint ${id} status changed to ${status}`
    );

    // Socket.io
    const io = req.app.get("io");

    if (io) {
      io.emit("complaintStatusUpdated", complaint);
    }

    res.status(200).json({
      message: "Status updated successfully",
      complaint,
    });
  } catch (error) {
    console.error("❌ Update Status Error:", error);

    res.status(500).json({
      message: "Failed to update status",
      error: error.message,
    });
  }
});

// ======================================================
// GET SINGLE COMPLAINT
// GET /api/complaints/:id
// ======================================================

router.get("/:id", async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({
        message: "Complaint not found",
      });
    }

    res.status(200).json(complaint);
  } catch (error) {
    console.error("❌ Fetch Complaint Error:", error);

    res.status(500).json({
      message: "Error fetching complaint",
      error: error.message,
    });
  }
});

// ======================================================
// GET MESSAGES
// GET /api/complaints/:id/messages
// ======================================================

router.get("/:id/messages", async (req, res) => {
  try {
    const messages = await Message.find({
      complaintId: req.params.id,
    }).sort({
      createdAt: 1,
    });

    res.status(200).json(messages);
  } catch (error) {
    console.error("❌ Fetch Messages Error:", error);

    res.status(500).json({
      message: "Failed to fetch messages",
      error: error.message,
    });
  }
});

// ======================================================
// POST MESSAGE
// POST /api/complaints/:id/messages
// ======================================================

router.post("/:id/messages", async (req, res) => {
  try {
    const { sender, text } = req.body;

    if (!sender || !text) {
      return res.status(400).json({
        message: "Sender and message are required",
      });
    }

    const newMessage = new Message({
      complaintId: req.params.id,
      sender,
      text,
    });

    const savedMessage = await newMessage.save();

    const io = req.app.get("io");

    if (io) {
      io.emit("newMessage", savedMessage);
    }

    res.status(201).json(savedMessage);
  } catch (error) {
    console.error("❌ Send Message Error:", error);

    res.status(500).json({
      message: "Failed to send message",
      error: error.message,
    });
  }
});

module.exports = router;