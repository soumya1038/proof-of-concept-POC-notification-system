import React, { useEffect, useState } from "react";
import {
  fetchUsers, createUser, deleteUser,
  fetchPosts, createPost, deletePost,
  likePost, createComment, followUser,
  fetchNotifications, markAllRead, clearAll
} from "./api";

export default function App() {
  // Data
  const [users, setUsers] = useState([]);
  const [activeUser, setActiveUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [notifications, setNotifications] = useState([]);

  // Form state
  const [newUsername, setNewUsername] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPost, setNewPost] = useState("");

  // Load initial data
  useEffect(() => {
    (async () => {
      const us = await fetchUsers();
      setUsers(us);
      if (us.length) setActiveUser(us[0]);
      const ps = await fetchPosts();
      setPosts(ps);
    })().catch(console.error);
  }, []);

  // Load notifications when active user changes
  useEffect(() => {
    if (!activeUser) return;
    (async () => {
      const ns = await fetchNotifications(activeUser._id);
      setNotifications(ns);
    })().catch(console.error);
  }, [activeUser]);

  // Helpers to reload
  const reloadUsers = async () => setUsers(await fetchUsers());
  const reloadPosts = async () => setPosts(await fetchPosts());
  const reloadNotifications = async () => {
    if (!activeUser) return;
    setNotifications(await fetchNotifications(activeUser._id));
  };

  // User actions
  const onAddUser = async () => {
    if (!newUsername.trim() || !newEmail.trim()) return;
    await createUser({ username: newUsername.trim(), email: newEmail.trim() });
    setNewUsername(""); setNewEmail("");
    await reloadUsers();
    if (!activeUser) {
      const us = await fetchUsers();
      if (us.length) setActiveUser(us[0]);
    }
  };
  const onDeleteUser = async (id) => {
    await deleteUser(id);
    await reloadUsers();
    if (activeUser && activeUser._id === id) {
      const us = await fetchUsers();
      setActiveUser(us[0] || null);
      await reloadNotifications();
    }
  };
  const onFollow = async (target) => {
    if (!activeUser || target._id === activeUser._id) return;
    await followUser({ followerId: activeUser._id, followeeId: target._id });
    await reloadNotifications();
  };

  // Post actions
  const onCreatePost = async () => {
    if (!activeUser || !newPost.trim()) return;
    await createPost({ author: activeUser._id, content: newPost.trim() });
    setNewPost("");
    await reloadPosts();
    await reloadNotifications();
  };
  const onLike = async (p) => {
    if (!activeUser) return;
    await likePost({ postId: p._id, userId: activeUser._id });
    await reloadPosts();
    await reloadNotifications();
  };
  const onComment = async (p) => {
    if (!activeUser) return;
    const text = window.prompt("Your comment:");
    if (!text || !text.trim()) return;
    await createComment({ postId: p._id, author: activeUser._id, content: text.trim() });
    await reloadNotifications();
  };
  const onDeletePost = async (id) => {
    await deletePost(id);
    await reloadPosts();
  };

  // Notification actions
  const onReadAll = async () => {
    if (!activeUser) return;
    await markAllRead(activeUser._id);
    await reloadNotifications();
  };
  const onClearAll = async () => {
    if (!activeUser) return;
    await clearAll(activeUser._id);
    setNotifications([]);
  };

  // UI
  return (
    <div style={{ padding: 16, display: "grid", gridTemplateColumns: "1fr 2fr 1fr", gap: 16 }}>
      {/* USERS */}
      <div>
        <h2>Users</h2>
        <div style={{ marginBottom: 8 }}>
          <div style={{ marginBottom: 6 }}>
            <label style={{ display: "block", fontSize: 12, color: "#555" }}>Active as</label>
            <select
              style={{ width: "100%", padding: 6 }}
              value={activeUser?._id || ""}
              onChange={(e) => setActiveUser(users.find(u => u._id === e.target.value))}
            >
              {users.map(u => <option key={u._id} value={u._id}>{u.username}</option>)}
            </select>
          </div>

          <div style={{ border: "1px solid #ddd", padding: 8, borderRadius: 6 }}>
            <div style={{ fontWeight: 600, marginBottom: 6 }}>Add new user</div>
            <input
              placeholder="username"
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              style={{ width: "100%", padding: 6, marginBottom: 6 }}
            />
            <input
              placeholder="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              style={{ width: "100%", padding: 6, marginBottom: 6 }}
            />
            <button onClick={onAddUser}>Add User</button>
          </div>
        </div>

        <ul style={{ listStyle: "none", paddingLeft: 0 }}>
          {users.map(u => (
            <li key={u._id} style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6 }}>
              <span style={{ flex: 1 }}>{u.username}</span>
              {activeUser && u._id !== activeUser._id && (
                <button onClick={() => onFollow(u)}>Follow</button>
              )}
              <button onClick={() => onDeleteUser(u._id)} style={{ background: "#f8d7da" }}>
                Delete
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* FEED */}
      <div>
        <h2>Feed</h2>
        {activeUser && (
          <div style={{ marginBottom: 12 }}>
            <input
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              placeholder="Write a post..."
              style={{ padding: 6, width: 280 }}
            />
            <button style={{ marginLeft: 8 }} onClick={onCreatePost}>Add Post</button>
          </div>
        )}
        {posts.map(p => (
          <div key={p._id} style={{ border: "1px solid #ddd", borderRadius: 6, padding: 10, marginBottom: 8 }}>
            <div style={{ fontWeight: 600 }}>{p.author?.username ?? "Unknown"}</div>
            <div style={{ margin: "6px 0" }}>{p.content}</div>
            <div style={{ fontSize: 12, color: "#666", marginBottom: 6 }}>
              Likes: {p.likes?.length ?? 0}
            </div>
            <div>
              <button onClick={() => onLike(p)}>Like / Unlike</button>
              <button onClick={() => onComment(p)} style={{ marginLeft: 8 }}>Comment</button>
              <button onClick={() => onDeletePost(p._id)} style={{ marginLeft: 8, background: "#f8d7da" }}>Delete</button>
            </div>
          </div>
        ))}
      </div>

      {/* NOTIFICATIONS */}
      <div>
        <h2>Notifications</h2>
        <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
          <button onClick={onReadAll}>Read all</button>
          <button onClick={onClearAll} style={{ background: "#f8d7da" }}>Clear</button>
        </div>
        {!activeUser && <div>Select a user…</div>}
        {activeUser && (
          notifications.length ? (
            notifications.map(n => (
              <div key={n._id} style={{ borderBottom: "1px solid #eee", padding: "6px 0" }}>
                {!n.read && <span style={{ color: "red", marginRight: 6 }}>●</span>}
                {n.message}
              </div>
            ))
          ) : (
            <div>No notifications</div>
          )
        )}
      </div>
    </div>
  );
}
