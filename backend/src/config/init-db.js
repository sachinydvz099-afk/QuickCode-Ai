db = connect('mongodb://localhost:27017/quickcode');

// Create collections with validators
db.createCollection('users', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['username', 'email', 'password'],
      properties: {
        username: {
          bsonType: 'string',
          description: 'must be a string and is required'
        },
        email: {
          bsonType: 'string',
          pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$',
          description: 'must be a valid email address and is required'
        },
        password: {
          bsonType: 'string',
          description: 'must be a string and is required'
        }
      }
    }
  }
});

db.createCollection('projects', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['name', 'owner'],
      properties: {
        name: {
          bsonType: 'string',
          description: 'must be a string and is required'
        },
        description: {
          bsonType: 'string',
          description: 'must be a string if present'
        },
        owner: {
          bsonType: 'objectId',
          description: 'must be an objectId and is required'
        },
        collaborators: {
          bsonType: 'array',
          items: {
            bsonType: 'objectId'
          },
          description: 'must be an array of objectIds'
        },
        files: {
          bsonType: 'array',
          items: {
            bsonType: 'object',
            required: ['name', 'content', 'lastModified'],
            properties: {
              name: {
                bsonType: 'string'
              },
              content: {
                bsonType: 'string'
              },
              lastModified: {
                bsonType: 'date'
              }
            }
          }
        }
      }
    }
  }
});

// Create indexes
db.users.createIndex({ "username": 1 }, { unique: true });
db.users.createIndex({ "email": 1 }, { unique: true });
db.projects.createIndex({ "name": 1, "owner": 1 }, { unique: true });

// Create an admin user for testing
db.users.insertOne({
  username: "admin",
  email: "admin@quickcode.ai",
  password: "$2a$10$XK7.GZPOg1yUvZUB1Z1XqOBgj0GxB1HB3ZIwZc9K3Z5G8X0V0Z0V0" // hashed password for "admin123"
});

print("Database initialization completed successfully!");