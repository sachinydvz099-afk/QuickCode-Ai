import mongoose, { Document, Schema } from 'mongoose';

export interface ICodeSession extends Document {
  projectId: mongoose.Types.ObjectId;
  fileId: string;
  activeUsers: mongoose.Types.ObjectId[];
  version: number;
  operations: {
    userId: mongoose.Types.ObjectId;
    type: 'insert' | 'delete' | 'replace';
    position: number;
    content: string;
    timestamp: Date;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const codeSessionSchema = new Schema({
  projectId: {
    type: Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  fileId: {
    type: String,
    required: true
  },
  activeUsers: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  version: {
    type: Number,
    default: 0
  },
  operations: [{
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    type: {
      type: String,
      enum: ['insert', 'delete', 'replace'],
      required: true
    },
    position: {
      type: Number,
      required: true
    },
    content: {
      type: String,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

export const CodeSession = mongoose.model<ICodeSession>('CodeSession', codeSessionSchema);