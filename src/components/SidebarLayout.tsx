import { Outlet, Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Video,
  MessageSquare,
  History,
  Upload,
  LogOut,
} from "lucide-react";
import api from "../api/axios";

export const SidebarLayout = () => {
  const location = useLocation();

  const menuItems = [
    { name: "Home Feed", path: "/", icon: <LayoutDashboard size={20} /> },
    { name: "My Videos", path: "/my-videos", icon: <Video size={20} /> },
    {
      name: "My Tweets",
      path: "/my-tweets",
      icon: <MessageSquare size={20} />,
    },
    { name: "Upload Content", path: "/upload", icon: <Upload size={20} /> },
    { name: "Watch History", path: "/history", icon: <History size={20} /> },
  ];

  const handleLogout = async () => {
    // Calls the backend logout to unset the refreshToken
    try {
      await api.post("/users/logout");
      window.location.href = "/login";
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Fixed Sidebar */}
      <aside className="w-64 bg-white border-r flex flex-col shadow-sm">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-blue-600 tracking-tight">
            Clustr
          </h1>
        </div>

        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-200 ${
                location.pathname === item.path
                  ? "bg-blue-600 text-white shadow-md"
                  : "text-gray-600 hover:bg-blue-50 hover:text-blue-600"
              }`}
            >
              {item.icon}
              <span className="font-semibold">{item.name}</span>
            </Link>
          ))}
        </nav>

        <button
          onClick={handleLogout}
          className="m-4 flex items-center gap-3 p-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors font-bold"
        >
          <LogOut size={20} />
          Logout
        </button>
      </aside>

      {/* Dynamic Content Area */}
      <main className="flex-1 overflow-y-auto bg-gray-50 p-8">
        <div className="max-w-6xl mx-auto">
          <Outlet /> {/* Renders the sub-route components here */}
        </div>
      </main>
    </div>
  );
};
