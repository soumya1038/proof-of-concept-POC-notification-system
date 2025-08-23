// notifications-poc/index.js
import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";

import User from "./models/User.js";
import Post from "./models/Post.js";
import Comment from "./models/Comment.js";
import Notification from "./models/Notification.js";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

// DB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB error:", err));

// Health
app.get("/health", (_req, res) => res.json({ ok: true }));

// --- USERS ---
app.get("/users", async (_req, res) => {
  const users = await User.find().select("_id username email");
  res.json(users);
});

app.post("/users", async (req, res) => {
  try {
    const { username, email } = req.body;
    if (!username || !email) return res.status(400).json({ error: "username and email required" });
    const user = await User.create({ username, email });
    res.json(user);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

app.delete("/users/:id", async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User deleted" });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// --- POSTS ---
app.get("/posts", async (_req, res) => {
  const posts = await Post.find().populate("author", "username").sort({ createdAt: -1 });
  res.json(posts);
});

app.post("/posts", async (req, res) => {
  try {
    const { author, content } = req.body;
    if (!author || !content) return res.status(400).json({ error: "author and content required" });

    const post = await Post.create({ author, content });

    // Notify author (POC confirmation)
    await Notification.create({
      recipient: author,
      type: "new_post",
      message: "Your post was created successfully.",
      read: false
    });

    const populated = await Post.findById(post._id).populate("author", "username");
    res.json(populated);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

app.delete("/posts/:id", async (req, res) => {
  try {
    await Post.findByIdAndDelete(req.params.id);
    res.json({ message: "Post deleted" });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// --- COMMENTS ---
app.post("/comments", async (req, res) => {
  try {
    const { postId, author, content } = req.body;
    if (!postId || !author || !content) {
      return res.status(400).json({ error: "postId, author, content required" });
    }
    const post = await Post.findById(postId).populate("author", "username");
    if (!post) return res.status(404).json({ error: "Post not found" });

    const comment = await Comment.create({ post: postId, author, content });

    await Notification.create({
      recipient: post.author._id,
      type: "new_comment",
      message: "Someone commented on your post.",
      read: false
    });

    res.json(comment);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// --- LIKES (toggle) ---
app.post("/likes", async (req, res) => {
  try {
    const { postId, userId } = req.body;
    if (!postId || !userId) return res.status(400).json({ error: "postId and userId required" });

    const post = await Post.findById(postId).populate("author", "username");
    if (!post) return res.status(404).json({ error: "Post not found" });

    const already = post.likes.some((u) => u.toString() === userId);
    if (already) {
      post.likes = post.likes.filter((u) => u.toString() !== userId);
    } else {
      post.likes.push(userId);
      await Notification.create({
        recipient: post.author._id,
        type: "new_like",
        message: "Your post received a new like.",
        read: false
      });
    }
    await post.save();
    res.json({ ok: true, liked: !already, likesCount: post.likes.length });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// --- FOLLOW ---
app.post("/follow", async (req, res) => {
  try {
    const { followerId, followeeId } = req.body;
    if (!followerId || !followeeId) {
      return res.status(400).json({ error: "followerId and followeeId required" });
    }
    if (followerId === followeeId) return res.status(400).json({ error: "Cannot follow yourself" });

    const follower = await User.findById(followerId);
    const followee = await User.findById(followeeId);
    if (!follower || !followee) return res.status(404).json({ error: "User not found" });

    if (!follower.following.some((id) => id.toString() === followeeId)) {
      follower.following.push(followeeId);
      await follower.save();
    }
    if (!followee.followers.some((id) => id.toString() === followerId)) {
      followee.followers.push(followerId);
      await followee.save();

      await Notification.create({
        recipient: followeeId,
        type: "new_follower",
        message: `${follower.username} started following you.`,
        read: false
      });
    }
    res.json({ ok: true });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// --- NOTIFICATIONS ---
app.get("/notifications/:userId", async (req, res) => {
  const items = await Notification.find({ recipient: req.params.userId })
    .sort({ createdAt: -1 })
    .lean();
  res.json(items);
});

app.put("/notifications/:userId/read-all", async (req, res) => {
  await Notification.updateMany({ recipient: req.params.userId }, { $set: { read: true } });
  res.json({ message: "All notifications marked as read" });
});

app.delete("/notifications/:userId/clear", async (req, res) => {
  await Notification.deleteMany({ recipient: req.params.userId });
  res.json({ message: "All notifications cleared" });
});

// --- SEED (optional) ---
app.post("/seed", async (_req, res) => {
  await Promise.all([User.deleteMany({}), Post.deleteMany({}), Comment.deleteMany({}), Notification.deleteMany({})]);
  const alice = await User.create({ username: "alice", email: "alice@example.com" });
  const bob = await User.create({ username: "bob", email: "bob@example.com" });
  const p1 = await Post.create({ author: alice._id, content: "Hello from Alice!" });
  const p2 = await Post.create({ author: bob._id, content: "Bob's first post" });
  res.json({ ok: true, users: [alice, bob], posts: [p1, p2] });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
