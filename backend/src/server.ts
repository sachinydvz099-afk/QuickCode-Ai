import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/database';
import { SocketHandler } from './socket/SocketHandler';
import authRoutes from './routes/auth';
import projectRoutes from './routes/projects';
import fileRoutes from './routes/files';
import aiRoutes from './routes/ai';

// Load environment variables
dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize Socket Handler
new SocketHandler(io);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/ai', aiRoutes);

// Basic health check route
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error'
  });
});

// Start server function
const startServer = async () => {
  try {
    // Connect to MongoDB first
    await connectDB();
    console.log('✓ Database connected successfully');
    
    // Then start the server
    const PORT = process.env.PORT || 5000;
    server.listen(PORT, () => {
      console.log(`✓ Server running on port ${PORT}`);
      console.log(`✓ Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
      console.log(`✓ API available at: http://localhost:${PORT}/api`);
      console.log(`\nServer is ready to accept connections!`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Start the server
startServer();