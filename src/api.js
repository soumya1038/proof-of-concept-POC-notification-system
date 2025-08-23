const API_URL = "http://localhost:5000";

const jsonFetch = async (url, opts = {}) => {
  const res = await fetch(url, opts);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP ${res.status}: ${text}`);
  }
  return res.json();
};

// Users
export const fetchUsers = () => jsonFetch(`${API_URL}/users`);
export const createUser = (username, email) =>
  jsonFetch(`${API_URL}/users`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, email }),
  });

// Posts
export const fetchPosts = () => jsonFetch(`${API_URL}/posts`);
export const createPost = ({ author, content }) =>
  jsonFetch(`${API_URL}/posts`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ author, content }),
  });

// Comments
export const createComment = ({ postId, author, content }) =>
  jsonFetch(`${API_URL}/comments`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ postId, author, content }),
  });

// Likes (toggle)
export const likePost = ({ postId, userId }) =>
  jsonFetch(`${API_URL}/likes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ postId, userId }),
  });

// Follow
export const followUser = ({ followerId, followeeId }) =>
  jsonFetch(`${API_URL}/follow`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ followerId, followeeId }),
  });

// Notifications
export const fetchNotifications = (userId) =>
  jsonFetch(`${API_URL}/notifications/${userId}`);
