import { useEffect, useState } from "react";
import { fetchUsers, fetchPosts, fetchNotifications } from "./api";

function App() {
  const [users, setUsers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    fetchUsers().then(setUsers);
    fetchPosts().then(setPosts);
    fetchNotifications().then(setNotifications);
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h1>📢 Notifications POC</h1>

      <section>
        <h2>👤 Users</h2>
        <ul>
          {users.map((u) => (
            <li key={u._id}>{u.name}</li>
          ))}
        </ul>
      </section>

      <section>
        <h2>📝 Posts</h2>
        <ul>
          {posts.map((p) => (
            <li key={p._id}>{p.content}</li>
          ))}
        </ul>
      </section>

      <section>
        <h2>🔔 Notifications</h2>
        <ul>
          {notifications.map((n) => (
            <li key={n._id}>{n.message}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}

export default App;
