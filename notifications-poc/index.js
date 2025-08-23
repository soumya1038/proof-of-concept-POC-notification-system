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

// ---- DB ----
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB error:", err));

// ---- health ----
app.get("/health", (req, res) => res.json({ ok: true }));

// ---- USERS ----
app.get("/users", async (req, res) => {
  const users = await User.find().select("_id username email");
  res.json(users);
});

app.post("/users", async (req, res) => {
  try {
    const { username, email } = req.body;
    const user = await User.create({ username, email });
    res.json(user);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// ---- POSTS ----
app.get("/posts", async (req, res) => {
  const posts = await Post.find()
    .populate("author", "username")
    .sort({ createdAt: -1 });
  res.json(posts);
});

app.post("/posts", async (req, res) => {
  try {
    const { author, content } = req.body;
    const post = await Post.create({ author, content });

    // Auto notify author (POC: confirm flow works)
    await Notification.create({
      recipient: author,
      type: "new_post",
      message: "Your post was created successfully."
    });

    const populated = await Post.findById(post._id).populate("author", "username");
    res.json(populated);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// ---- COMMENTS ----
app.post("/comments", async (req, res) => {
  try {
    const { postId, author, content } = req.body;
    const post = await Post.findById(postId).populate("author", "username");
    if (!post) return res.status(404).json({ error: "Post not found" });

    const comment = await Comment.create({ post: postId, author, content });

    // Notify post owner
    await Notification.create({
      recipient: post.author._id,
      type: "new_comment",
      message: "Someone commented on your post."
    });

    res.json(comment);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// ---- LIKES (toggle like) ----
app.post("/likes", async (req, res) => {
  try {
    const { postId, userId } = req.body;
    const post = await Post.findById(postId).populate("author", "username");
    if (!post) return res.status(404).json({ error: "Post not found" });

    const alreadyLiked = post.likes.some((u) => u.toString() === userId);
    if (alreadyLiked) {
      post.likes = post.likes.filter((u) => u.toString() !== userId);
    } else {
      post.likes.push(userId);
      // Notify post owner (only on like, not on unlike)
      await Notification.create({
        recipient: post.author._id,
        type: "new_like",
        message: "Your post received a new like."
      });
    }

    await post.save();
    res.json({ ok: true, liked: !alreadyLiked, likesCount: post.likes.length });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// ---- FOLLOW ----
app.post("/follow", async (req, res) => {
  try {
    const { followerId, followeeId } = req.body;
    if (followerId === followeeId) {
      return res.status(400).json({ error: "Cannot follow yourself" });
    }
    const follower = await User.findById(followerId);
    const followee = await User.findById(followeeId);
    if (!follower || !followee) return res.status(404).json({ error: "User not found" });

    // prevent duplicates
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
        message: `${follower.username} started following you.`
      });
    }
    res.json({ ok: true });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// ---- NOTIFICATIONS ----
app.get("/notifications/:userId", async (req, res) => {
  const { userId } = req.params;
  const items = await Notification.find({ recipient: userId }).sort({ createdAt: -1 }).lean();
  res.json(items);
});

// ---- SEED (optional) ----
app.post("/seed", async (req, res) => {
  await Promise.all([
    User.deleteMany({}),
    Post.deleteMany({}),
    Comment.deleteMany({}),
    Notification.deleteMany({})
  ]);

  const alice = await User.create({ username: "alice", email: "alice@example.com" });
  const bob = await User.create({ username: "bob", email: "bob@example.com" });
  const p1 = await Post.create({ author: alice._id, content: "Hello from Alice!" });
  const p2 = await Post.create({ author: bob._id, content: "Bob's first post" });

  res.json({ ok: true, users: [alice, bob], posts: [p1, p2] });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
