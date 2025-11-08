import { Server, Socket } from 'socket.io';
import { CodeSession } from '../models/CodeSession';
import { Project } from '../models/Project';
import mongoose from 'mongoose';

interface CodeOperation {
  userId: string;
  type: 'insert' | 'delete' | 'replace';
  position: number;
  content: string;
}

export class SocketHandler {
  private io: Server;

  constructor(io: Server) {
    this.io = io;
    this.setupSocketHandlers();
  }

  private setupSocketHandlers() {
    this.io.on('connection', (socket: Socket) => {
      console.log('Client connected:', socket.id);

      socket.on('joinSession', async (data: { projectId: string, fileId: string, userId: string }) => {
        try {
          const session = await this.getOrCreateSession(data.projectId, data.fileId);
          socket.join(`${data.projectId}-${data.fileId}`);
          
          // Add user to active users if not already present
          if (!session.activeUsers.includes(new mongoose.Types.ObjectId(data.userId))) {
            session.activeUsers.push(new mongoose.Types.ObjectId(data.userId));
            await session.save();
          }

          // Notify other users about the new user
          socket.to(`${data.projectId}-${data.fileId}`).emit('userJoined', { userId: data.userId });
          
          // Send current session state to the joining user
          socket.emit('sessionState', {
            version: session.version,
            activeUsers: session.activeUsers
          });
        } catch (error) {
          console.error('Error joining session:', error);
          socket.emit('error', { message: 'Failed to join session' });
        }
      });

      socket.on('codeOperation', async (data: {
        projectId: string;
        fileId: string;
        userId: string;
        operation: CodeOperation;
      }) => {
        try {
          const session = await CodeSession.findOne({
            projectId: data.projectId,
            fileId: data.fileId
          });

          if (!session) {
            throw new Error('Session not found');
          }

          // Apply operation to the session
          const operationWithTimestamp = {
            ...data.operation,
            userId: new mongoose.Types.ObjectId(data.userId),
            timestamp: new Date()
          };
          session.operations.push(operationWithTimestamp);
          session.version += 1;

          // Update the file content in the project
          await Project.updateOne(
            { 
              _id: data.projectId,
              'files.name': data.fileId 
            },
            { 
              $set: { 
                'files.$.lastModified': new Date()
              }
            }
          );

          await session.save();

          // Broadcast the operation to other users in the session
          socket.to(`${data.projectId}-${data.fileId}`).emit('codeOperation', {
            operation: data.operation,
            userId: data.userId,
            version: session.version
          });
        } catch (error) {
          console.error('Error processing code operation:', error);
          socket.emit('error', { message: 'Failed to process code operation' });
        }
      });

      socket.on('leaveSession', async (data: { projectId: string, fileId: string, userId: string }) => {
        try {
          const session = await CodeSession.findOne({
            projectId: data.projectId,
            fileId: data.fileId
          });

          if (session) {
            // Remove user from active users
            session.activeUsers = session.activeUsers.filter(
              id => id.toString() !== data.userId
            );
            await session.save();

            // Notify other users
            socket.to(`${data.projectId}-${data.fileId}`).emit('userLeft', { userId: data.userId });
          }

          socket.leave(`${data.projectId}-${data.fileId}`);
        } catch (error) {
          console.error('Error leaving session:', error);
        }
      });

      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
      });
    });
  }

  private async getOrCreateSession(projectId: string, fileId: string) {
    let session = await CodeSession.findOne({ projectId, fileId });
    
    if (!session) {
      session = new CodeSession({
        projectId: new mongoose.Types.ObjectId(projectId),
        fileId,
        activeUsers: [],
        version: 0,
        operations: []
      });
      await session.save();
    }

    return session;
  }
}