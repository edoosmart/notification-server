db = db.getSiblingDB('admin');
db.auth('admin', 'password123');

db = db.getSiblingDB('notification');

// Drop existing collections if they exist
db.users.drop();
db.notifications.drop();

// Create collections
db.createCollection('users');
db.createCollection('notifications');

// Insert sample users
db.users.insertMany([
  {
    email: 'user1@example.com',
    name: 'User One',
    fcmToken: 'sample-fcm-token-1',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    email: 'user2@example.com',
    name: 'User Two',
    fcmToken: 'sample-fcm-token-2',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }
]);

// Insert sample notifications
db.notifications.insertMany([
  {
    userId: 'user1@example.com',
    title: 'Welcome Notification',
    body: 'Welcome to our notification system!',
    isRead: false,
    fcmToken: 'sample-fcm-token-1',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    userId: 'user2@example.com',
    title: 'Getting Started',
    body: 'Here are some tips to get started with our system.',
    isRead: false,
    fcmToken: 'sample-fcm-token-2',
    createdAt: new Date(),
    updatedAt: new Date()
  }
]); 