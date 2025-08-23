# Insyd Notifications POC 🚀

Proof-of-concept notification system for **Insyd** (social platform for the Architecture Industry).  
Implements a simple **Node.js + Express + MongoDB backend** with a **React frontend**.  
Designed for ~100 DAUs but structured for easy scaling to 1M+ DAUs.

---

## ✨ Features

### Users
- Add new users
- Delete users
- Switch between active users
- Follow other users → triggers **"new follower"** notification

### Posts
- Create new posts
- Like / Unlike posts → triggers **"new like"** notification
- Comment on posts → triggers **"new comment"** notification
- Delete posts

### Notifications
- Auto-triggered on **post, like, comment, follow**
- Displayed in UI with unread dot `●`
- **Read All** button → marks notifications as read (dot disappears)
- **Clear** button → removes all notifications from DB

---

## 🛠 Tech Stack

- **Backend**: Node.js, Express, MongoDB (Mongoose), CORS, dotenv
- **Frontend**: React (Create React App), Fetch API (no axios)

---

## 📂 Project Structure

.
├── notifications-poc # Backend (Node/Express)
│ ├── models
│ │ ├── User.js
│ │ ├── Post.js
│ │ ├── Comment.js
│ │ └── Notification.js
│ ├── index.js # Express server
│ └── .env # MongoDB URI
│
└── insyd-notification-frontend # Frontend (React)
└── src
├── App.js
├── api.js
└── index.js

-----

1. Backend Setup (notifications-poc)

cd notifications-poc
npm install

---

MONGO_URI=mongodb+srv://<your-cluster-uri>
PORT=5000

---

npm run dev   # with nodemon
# or
node index.js
Server runs at http://localhost:5000

2. Frontend Setup (insyd-notification-frontend)

cd insyd-notification-frontend
npm install
npm start


🔗 API Endpoints
Users

GET /users → list all users

POST /users → add new user { username, email }

DELETE /users/:id → delete user

Posts

GET /posts → list all posts

POST /posts → add post { author, content }

DELETE /posts/:id → delete post

Comments

POST /comments → add comment { postId, author, content }

Likes

POST /likes → toggle like { postId, userId }

Follow

POST /follow → follow { followerId, followeeId }

Notifications

GET /notifications/:userId → list user notifications

PUT /notifications/:userId/read-all → mark all as read

DELETE /notifications/:userId/clear → clear all notifications

🧪 Quick Demo Data

Seed users & posts
POST http://localhost:5000/seed


Creates:

User alice

User bob

Posts for both

📸 UI Overview

Left: Users list (switch, add, follow, delete)

Middle: Feed (create post, like, comment, delete)

Right: Notifications (auto-updated, read-all, clear)

📌 Notes

Notifications are stored in MongoDB with a read flag.

Only essential POC functionality is included.

Scalable by moving notifications to queue/broker (e.g., Kafka, RabbitMQ) for 1M+ DAUs.
---
