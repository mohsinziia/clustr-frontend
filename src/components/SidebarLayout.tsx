import { useState, useEffect } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  MessageSquare,
  History,
  Upload,
  LogOut,
  Settings,
  Film,
  Search,
} from "lucide-react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { Logo } from "./Logo";
import { useVideoPlayer } from "./VideoPlayerContext";
import { GlobalVideoModal } from "./GlobalVideoModal";

export const SidebarLayout = () => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const { activeVideo, closeVideo } = useVideoPlayer();

  // Search State
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.trim()) {
        setIsSearching(true);
        try {
          const { data } = await api.get(`/users/search?query=${searchQuery}`);
          setSearchResults(data.data);
        } catch (err) {
          console.error("Search failed", err);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

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
      ? "bg-blue-600 text-white shadow-md dark:shadow-blue-900/20"
      : "text-gray-600 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-[#1f1b2e] hover:text-blue-600 dark:hover:text-blue-400"
    }`;

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-[#13111C] overflow-hidden text-gray-900 dark:text-white transition-colors">
      <aside className="w-64 bg-white dark:bg-[#1a1725] border-r border-gray-200 dark:border-gray-800 flex flex-col shadow-sm shrink-0 transition-colors">
        <div className="p-6 flex items-center gap-3">
          <Logo size={32} />
          <h1 className="text-2xl font-bold text-blue-600 tracking-tight">Clustr</h1>
        </div>

        {/* Search Section */}
        <div className="px-4 mb-4 relative">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={16} />
            <input
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-50 dark:bg-[#13111C] border border-gray-200 dark:border-gray-800 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all dark:text-white"
            />
          </div>

          {/* Results Dropdown */}
          {searchQuery && (
            <div className="absolute left-4 right-4 mt-2 bg-white dark:bg-[#1a1725] border border-gray-200 dark:border-gray-800 rounded-2xl shadow-xl z-50 overflow-hidden max-h-64 overflow-y-auto">
              {isSearching ? (
                <div className="p-4 text-center text-sm text-gray-500">Searching...</div>
              ) : searchResults.length > 0 ? (
                searchResults.map(userResult => (
                  <Link
                    key={userResult._id}
                    to={`/channel/${userResult.username}`}
                    onClick={() => setSearchQuery("")}
                    className="flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-[#252134] transition-colors"
                  >
                    <img
                      src={userResult.avatar?.url || userResult.avatar}
                      className="w-8 h-8 rounded-full object-cover border border-gray-100 dark:border-gray-800"
                      alt=""
                    />
                    <div className="flex flex-col">
                      <span className="text-sm font-bold dark:text-white">{userResult.fullName}</span>
                      <span className="text-xs text-gray-500">@{userResult.username}</span>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="p-4 text-center text-sm text-gray-500">No users found</div>
              )}
            </div>
          )}
        </div>

        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => (
            <Link key={item.path} to={item.path} className={getLinkClassName(item.path)}>
              <div className="w-6 flex items-center justify-center shrink-0">
                {item.icon}
              </div>
              <span className="font-semibold">{item.name}</span>
            </Link>
          ))}

          <Link to={`/channel/${user?.username}`} className={getLinkClassName(`/channel/${user?.username}`)}>
            <div className="w-6 flex items-center justify-center shrink-0">
              <img
                src={user?.avatar?.url || user?.avatar}
                className={`w-6 h-6 rounded-full object-cover border-2 transition-colors ${location.pathname === `/channel/${user?.username}`
                  ? 'border-white/50'
                  : 'border-gray-200 dark:border-gray-700'
                  }`}
                alt=""
              />
            </div>
            <span className="font-semibold">My Channel</span>
          </Link>

          <Link to="/settings" className={getLinkClassName("/settings")}>
            <div className="w-6 flex items-center justify-center shrink-0">
              <Settings size={20} />
            </div>
            <span className="font-semibold">Settings</span>
          </Link>
        </nav>

        <button
          onClick={handleLogout}
          className="m-4 flex items-center gap-3 p-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors font-bold"
        >
          <div className="w-6 flex items-center justify-center shrink-0">
            <LogOut size={20} />
          </div>
          Logout
        </button>
      </aside>

      <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-[#13111C] p-8 transition-colors">
        <div className="max-w-6xl mx-auto">
          <Outlet />
        </div>
      </main>

      {/* Global Video Modal */}
      {activeVideo && (
        <GlobalVideoModal
          video={activeVideo}
          onClose={closeVideo}
        />
      )}
    </div>
  );
};