"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocketHandler = void 0;
const CodeSession_1 = require("../models/CodeSession");
const Project_1 = require("../models/Project");
const mongoose_1 = __importDefault(require("mongoose"));
class SocketHandler {
    constructor(io) {
        this.io = io;
        this.setupSocketHandlers();
    }
    setupSocketHandlers() {
        this.io.on('connection', (socket) => {
            console.log('Client connected:', socket.id);
            socket.on('joinSession', (data) => __awaiter(this, void 0, void 0, function* () {
                try {
                    const session = yield this.getOrCreateSession(data.projectId, data.fileId);
                    socket.join(`${data.projectId}-${data.fileId}`);
                    // Add user to active users if not already present
                    if (!session.activeUsers.includes(new mongoose_1.default.Types.ObjectId(data.userId))) {
                        session.activeUsers.push(new mongoose_1.default.Types.ObjectId(data.userId));
                        yield session.save();
                    }
                    // Notify other users about the new user
                    socket.to(`${data.projectId}-${data.fileId}`).emit('userJoined', { userId: data.userId });
                    // Send current session state to the joining user
                    socket.emit('sessionState', {
                        version: session.version,
                        activeUsers: session.activeUsers
                    });
                }
                catch (error) {
                    console.error('Error joining session:', error);
                    socket.emit('error', { message: 'Failed to join session' });
                }
            }));
            socket.on('codeOperation', (data) => __awaiter(this, void 0, void 0, function* () {
                try {
                    const session = yield CodeSession_1.CodeSession.findOne({
                        projectId: data.projectId,
                        fileId: data.fileId
                    });
                    if (!session) {
                        throw new Error('Session not found');
                    }
                    // Apply operation to the session
                    const operationWithTimestamp = Object.assign(Object.assign({}, data.operation), { userId: new mongoose_1.default.Types.ObjectId(data.userId), timestamp: new Date() });
                    session.operations.push(operationWithTimestamp);
                    session.version += 1;
                    // Update the file content in the project
                    yield Project_1.Project.updateOne({
                        _id: data.projectId,
                        'files.name': data.fileId
                    }, {
                        $set: {
                            'files.$.lastModified': new Date()
                        }
                    });
                    yield session.save();
                    // Broadcast the operation to other users in the session
                    socket.to(`${data.projectId}-${data.fileId}`).emit('codeOperation', {
                        operation: data.operation,
                        userId: data.userId,
                        version: session.version
                    });
                }
                catch (error) {
                    console.error('Error processing code operation:', error);
                    socket.emit('error', { message: 'Failed to process code operation' });
                }
            }));
            socket.on('leaveSession', (data) => __awaiter(this, void 0, void 0, function* () {
                try {
                    const session = yield CodeSession_1.CodeSession.findOne({
                        projectId: data.projectId,
                        fileId: data.fileId
                    });
                    if (session) {
                        // Remove user from active users
                        session.activeUsers = session.activeUsers.filter(id => id.toString() !== data.userId);
                        yield session.save();
                        // Notify other users
                        socket.to(`${data.projectId}-${data.fileId}`).emit('userLeft', { userId: data.userId });
                    }
                    socket.leave(`${data.projectId}-${data.fileId}`);
                }
                catch (error) {
                    console.error('Error leaving session:', error);
                }
            }));
            socket.on('disconnect', () => {
                console.log('Client disconnected:', socket.id);
            });
        });
    }
    getOrCreateSession(projectId, fileId) {
        return __awaiter(this, void 0, void 0, function* () {
            let session = yield CodeSession_1.CodeSession.findOne({ projectId, fileId });
            if (!session) {
                session = new CodeSession_1.CodeSession({
                    projectId: new mongoose_1.default.Types.ObjectId(projectId),
                    fileId,
                    activeUsers: [],
                    version: 0,
                    operations: []
                });
                yield session.save();
            }
            return session;
        });
    }
}
exports.SocketHandler = SocketHandler;
