// src/api.js
const API_URL = "http://localhost:5000"; // backend base URL

export const fetchUsers = async () => {
  const res = await fetch(`${API_URL}/users`);
  return res.json();
};

export const fetchPosts = async () => {
  const res = await fetch(`${API_URL}/posts`);
  return res.json();
};

export const fetchNotifications = async () => {
  const res = await fetch(`${API_URL}/notifications`);
  return res.json();
};
