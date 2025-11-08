# MongoDB Database Setup Guide

1. First, make sure MongoDB is installed:
   - Download MongoDB Community Server from: https://www.mongodb.com/try/download/community
   - Run the installer and follow the installation wizard
   - Make sure to install MongoDB Compass (the GUI tool) when prompted

2. After installation:
   - MongoDB should be running as a Windows service
   - The default port is 27017
   - Data directory is at C:\data\db

3. To initialize the database:
   - Open MongoDB Compass
   - Connect to mongodb://localhost:27017
   - Create a new database named "quickcode"
   - Open MongoDB Shell and run:
     ```
     load("c:/Users/DELL/Desktop/QuickCode Ai/backend/src/config/init-db.js")
     ```

4. Default admin credentials:
   - Username: admin
   - Email: admin@quickcode.ai
   - Password: admin123

5. Verify setup:
   - Start the backend server (npm run dev)
   - Try logging in with the admin credentials
   - Check MongoDB Compass to see the collections

If you encounter any issues:
1. Make sure MongoDB service is running
2. Check MongoDB logs at C:\data\log\mongod.log
3. Verify the connection string in .env file