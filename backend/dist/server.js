"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const cors_1 = __importDefault(require("cors"));
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const SocketHandler_1 = require("./socket/SocketHandler");
const auth_1 = __importDefault(require("./routes/auth"));
const projects_1 = __importDefault(require("./routes/projects"));
const files_1 = __importDefault(require("./routes/files"));
// Load environment variables
dotenv_1.default.config();
const app = (0, express_1.default)();
const server = (0, http_1.createServer)(app);
const io = new socket_io_1.Server(server, {
    cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:3000",
        methods: ["GET", "POST"]
    }
});
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/vibe-coding';
mongoose_1.default.connect(MONGODB_URI)
    .then(() => {
    console.log('Connected to MongoDB');
})
    .catch((err) => {
    console.error('Error connecting to MongoDB:', err);
});
// Initialize Socket Handler
new SocketHandler_1.SocketHandler(io);
// Routes
app.use('/api/auth', auth_1.default);
app.use('/api/projects', projects_1.default);
app.use('/api/files', files_1.default);
// Basic health check route
app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});
const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
