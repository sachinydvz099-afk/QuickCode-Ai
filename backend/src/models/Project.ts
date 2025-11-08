import mongoose, { Document, Schema } from 'mongoose';

export interface IProject extends Document {
  name: string;
  description: string;
  owner: mongoose.Types.ObjectId;
  collaborators: mongoose.Types.ObjectId[];
  files: {
    name: string;
    content: string;
    lastModified: Date;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const projectSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: false,
    trim: true
  },
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  collaborators: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  files: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    content: {
      type: String,
      default: ''
    },
    lastModified: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

export const Project = mongoose.model<IProject>('Project', projectSchema);