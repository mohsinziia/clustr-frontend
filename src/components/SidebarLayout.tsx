import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  MessageSquare,
  History,
  Upload,
  LogOut,
  Settings,
  Film,
} from "lucide-react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

export const SidebarLayout = () => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const menuItems = [
    { name: 'Video Feed', path: '/', icon: <LayoutDashboard size={20} /> },
    { name: 'Explore Tweets', path: '/tweets', icon: <MessageSquare size={20} /> },
    { name: 'Upload', path: '/upload', icon: <Upload size={20} /> },
    { name: 'History', path: '/history', icon: <History size={20} /> },
  ];

  const handleLogout = async () => {
    try {
      await api.post("/users/logout");
      window.location.href = "/login";
    } catch (err) {
      console.error("Logout failed", err);
    }
    logout();
    navigate('/login');
  };

  const getLinkClassName = (path: string) =>
    `flex items-center gap-3 p-3 rounded-lg transition-all duration-200 ${location.pathname === path
      ? "bg-blue-600 text-white shadow-md"
      : "text-gray-600 hover:bg-blue-50 hover:text-blue-600"
    }`;

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <aside className="w-64 bg-white border-r flex flex-col shadow-sm shrink-0">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-blue-600 tracking-tight">Clustr</h1>
        </div>

        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => (
            <Link key={item.path} to={item.path} className={getLinkClassName(item.path)}>
              {item.icon}
              <span className="font-semibold">{item.name}</span>
            </Link>
          ))}

          <Link to={`/channel/${user?.username}`} className={getLinkClassName(`/channel/${user?.username}`)}>
            <img
              src={user?.avatar?.url || user?.avatar}
              className={`w-7 h-7 rounded-full object-cover shrink-0 border-2 transition-colors ${location.pathname === `/channel/${user?.username}`
                  ? 'border-white/50'
                  : 'border-gray-200'
                }`}
              alt=""
            />
            <span className="font-semibold">My Channel</span>
          </Link>

          <Link to="/settings" className={getLinkClassName("/settings")}>
            <Settings size={20} />
            <span className="font-semibold">Settings</span>
          </Link>
        </nav>

        <button
          onClick={handleLogout}
          className="m-4 flex items-center gap-3 p-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors font-bold"
        >
          <LogOut size={20} />
          Logout
        </button>
      </aside>

      <main className="flex-1 overflow-y-auto bg-gray-50 p-8">
        <div className="max-w-6xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};