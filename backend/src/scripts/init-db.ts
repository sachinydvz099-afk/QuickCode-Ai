import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { User } from '../models/User';
import { Project } from '../models/Project';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/quickcode';

async function initializeDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Project.deleteMany({});
    console.log('Cleared existing data');

    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const adminUser = await User.create({
      username: 'admin',
      email: 'admin@quickcode.ai',
      password: hashedPassword
    });
    console.log('Created admin user');

    // Create sample project
    const sampleProject = await Project.create({
      name: 'Sample Project',
      description: 'A sample project to get you started',
      owner: adminUser._id,
      files: [
        {
          name: 'main.js',
          content: '// Welcome to QuickCode!\nconsole.log("Hello, World!");',
          lastModified: new Date()
        },
        {
          name: 'index.html',
          content: '<!DOCTYPE html>\n<html>\n<head>\n  <title>Welcome</title>\n</head>\n<body>\n  <h1>Welcome to QuickCode</h1>\n</body>\n</html>',
          lastModified: new Date()
        }
      ]
    });
    console.log('Created sample project');

    console.log('\nDatabase initialized successfully!');
    console.log('\nAdmin credentials:');
    console.log('Email: admin@quickcode.ai');
    console.log('Password: admin123');

  } catch (error) {
    console.error('Error initializing database:', error);
  } finally {
    await mongoose.disconnect();
  }
}

initializeDatabase();