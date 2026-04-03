import type { User } from "./types";

const Dashboard = ({
  user,
  onLogout,
}: {
  user: User;
  onLogout: () => void;
}) => {
  return (
    <>
      <div
        style={{ background: "#0f0f0f", minHeight: "100vh", color: "white" }}
      >
        {/* Navbar */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            padding: "15px 30px",
            background: "#1c1c1c",
          }}
        >
          <h2>Clustr</h2>

          <div>
            <span style={{ marginRight: 15 }}>
              {user.fullName || user.username}
            </span>
            <button onClick={onLogout}>Logout</button>
          </div>
        </div>

        {/* Home Content */}
        <div style={{ padding: 30 }}>
          <h3>Welcome to VidTube 🎬</h3>
          <p>This is your logged-in home screen.</p>

          {/* Placeholder for your actual features */}
          <div
            style={{
              marginTop: 20,
              padding: 20,
              background: "#1c1c1c",
              borderRadius: 10,
            }}
          >
            <p>👉 Your videos will go here</p>
            <p>👉 Your dashboard UI can go here</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
