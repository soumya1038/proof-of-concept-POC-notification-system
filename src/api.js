const API_URL = "http://localhost:5000";

const jsonFetch = async (url, opts = {}) => {
  const res = await fetch(url, opts);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.status === 204 ? null : res.json();
};

// Users
export const fetchUsers = () => jsonFetch(`${API_URL}/users`);
export const createUser = ({ username, email }) =>
  jsonFetch(`${API_URL}/users`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, email })
  });
export const deleteUser = (id) =>
  jsonFetch(`${API_URL}/users/${id}`, { method: "DELETE" });

// Posts
export const fetchPosts = () => jsonFetch(`${API_URL}/posts`);
export const createPost = ({ author, content }) =>
  jsonFetch(`${API_URL}/posts`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ author, content })
  });
export const deletePost = (id) =>
  jsonFetch(`${API_URL}/posts/${id}`, { method: "DELETE" });

// Interactions
export const likePost = ({ postId, userId }) =>
  jsonFetch(`${API_URL}/likes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ postId, userId })
  });
export const createComment = ({ postId, author, content }) =>
  jsonFetch(`${API_URL}/comments`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ postId, author, content })
  });
export const followUser = ({ followerId, followeeId }) =>
  jsonFetch(`${API_URL}/follow`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ followerId, followeeId })
  });

// Notifications
export const fetchNotifications = (userId) =>
  jsonFetch(`${API_URL}/notifications/${userId}`);
export const markAllRead = (userId) =>
  jsonFetch(`${API_URL}/notifications/${userId}/read-all`, { method: "PUT" });
export const clearAll = (userId) =>
  jsonFetch(`${API_URL}/notifications/${userId}/clear`, { method: "DELETE" });
