import React, { useEffect, useState } from "react";
import {
  fetchUsers,
  fetchPosts,
  fetchNotifications,
  createPost,
  createComment,
  likePost,
  followUser,
} from "./api";

export default function App() {
  const [users, setUsers] = useState([]);
  const [activeUser, setActiveUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [newPost, setNewPost] = useState("");

  // Initial load
  useEffect(() => {
    (async () => {
      const us = await fetchUsers();
      setUsers(us);
      if (us.length > 0) setActiveUser(us[0]); // pick first
      const ps = await fetchPosts();
      setPosts(ps);
    })().catch((e) => console.error("Init error:", e));
  }, []);

  // Load notifications for active user
  useEffect(() => {
    if (!activeUser) return;
    (async () => {
      const ns = await fetchNotifications(activeUser._id);
      setNotifications(ns);
    })().catch((e) => console.error("Notif error:", e));
  }, [activeUser]);

  const reloadPosts = async () => setPosts(await fetchPosts());
  const reloadNotifications = async () => {
    if (!activeUser) return;
    setNotifications(await fetchNotifications(activeUser._id));
  };

  // Actions
  const onCreatePost = async () => {
    if (!activeUser || !newPost.trim()) return;
    await createPost({ author: activeUser._id, content: newPost.trim() });
    setNewPost("");
    await reloadPosts();
    await reloadNotifications();
  };

  const onLike = async (post) => {
    if (!activeUser) return;
    await likePost({ postId: post._id, userId: activeUser._id });
    await reloadPosts(); // to refresh like counts
    await reloadNotifications();
  };

  const onComment = async (post) => {
    if (!activeUser) return;
    const text = window.prompt("Your comment:");
    if (!text || !text.trim()) return;
    await createComment({ postId: post._id, author: activeUser._id, content: text.trim() });
    await reloadNotifications();
  };

  const onFollow = async (u) => {
    if (!activeUser || u._id === activeUser._id) return;
    await followUser({ followerId: activeUser._id, followeeId: u._id });
    await reloadNotifications();
  };

  // UI
  return (
    <div style={{ padding: 16, display: "grid", gridTemplateColumns: "1fr 2fr 1fr", gap: 16 }}>
      {/* Users */}
      <div>
        <h2>Users</h2>
        <div style={{ marginBottom: 8 }}>
          <label style={{ marginRight: 8 }}>Active as:</label>
          <select
            value={activeUser?._id || ""}
            onChange={(e) => setActiveUser(users.find((u) => u._id === e.target.value))}
          >
            {users.map((u) => (
              <option key={u._id} value={u._id}>{u.username}</option>
            ))}
          </select>
        </div>
        <ul style={{ listStyle: "none", paddingLeft: 0 }}>
          {users.map((u) => (
            <li key={u._id} style={{ marginBottom: 6 }}>
              {u.username}{" "}
              {activeUser && u._id !== activeUser._id && (
                <button onClick={() => onFollow(u)}>Follow</button>
              )}
            </li>
          ))}
        </ul>
      </div>

      {/* Feed */}
      <div>
        <h2>Feed</h2>
        {activeUser && (
          <div style={{ marginBottom: 12 }}>
            <input
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              placeholder="Write a post..."
              style={{ padding: 6, width: 260 }}
            />
            <button style={{ marginLeft: 8 }} onClick={onCreatePost}>Add Post</button>
          </div>
        )}
        {posts.map((p) => (
          <div key={p._id} style={{ border: "1px solid #ddd", padding: 12, marginBottom: 8 }}>
            <div style={{ fontWeight: 600 }}>{p.author?.username ?? "Unknown"}</div>
            <div style={{ margin: "6px 0" }}>{p.content}</div>
            <div style={{ fontSize: 12, color: "#666", marginBottom: 6 }}>
              Likes: {p.likes?.length ?? 0}
            </div>
            <div>
              <button onClick={() => onLike(p)}>Like / Unlike</button>
              <button onClick={() => onComment(p)} style={{ marginLeft: 8 }}>Comment</button>
            </div>
          </div>
        ))}
      </div>

      {/* Notifications */}
      <div>
        <h2>Notifications</h2>
        {!activeUser && <div>Select a user…</div>}
        {activeUser && (notifications.length ? (
          notifications.map((n) => (
            <div key={n._id} style={{ borderBottom: "1px solid #eee", padding: "6px 0" }}>
              {n.message}
            </div>
          ))
        ) : (
          <div>No notifications</div>
        ))}
      </div>
    </div>
  );
}
