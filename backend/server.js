const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const nodemailer = require('nodemailer');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const complaintRoutes = require('./routes/complaints');
const chatRoutes = require('./routes/chat');

const allowedOrigins = [
  'https://smartbridge-project-frontend.onrender.com',
  'https://smartbridge-project-1.onrender.com',
  'http://localhost:5173'
];

const app = express();

// 1. Create HTTP server from Express app
const server = http.createServer(app);

// 2. Attach Socket.io to HTTP server with CORS config
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true
  }
});

// 3. Make 'io' accessible in Express route handlers (via req.app.get('io'))
app.set('io', io);

// Socket.io connection event listeners
io.on('connection', (socket) => {
  console.log('⚡ Client connected to Socket.io:', socket.id);
  socket.on('disconnect', () => {
    console.log('❌ Client disconnected:', socket.id);
  });
});

// ✅ Middleware: JSON parser
app.use(express.json());

// ✅ Middleware: CORS
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// ✅ Session Middleware with MongoDB store
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGO_URI
  }),
  cookie: {
    secure: true,
    sameSite: 'None',
    httpOnly: true
  }
}));

// ✅ MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));

// ✅ API Routes
app.use('/api', authRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/chat',chatRoutes);

// ✅ Feedback Mail Route
app.post('/api/send-feedback-mail', async (req, res) => {
  const { email, name, complaintTitle, complaintId } = req.body;

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const mailOptions = {
      from: `"ResolveNow" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `Complaint #${complaintId} Received`,
      html: `
        <h3>Hello ${name},</h3>
        <p>We’ve received your complaint: <strong>${complaintTitle}</strong>.</p>
        <p>Your Complaint ID is: <strong>${complaintId}</strong>.</p>
        <p>We’ll keep you updated on its progress.</p>
        <br />
        <p>Regards,<br />ResolveNow Team</p>
      `
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: 'Email sent successfully' });
  } catch (err) {
    console.error('❌ Email error:', err.message);
    res.status(500).json({ message: 'Failed to send email' });
  }
});

// 4. Start Server listening via HTTP server instance (not app.listen)
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});