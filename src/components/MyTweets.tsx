import React, { useEffect, useState, useCallback } from "react";
import api from "../api/axios";
import type { ApiResponse, PaginatedData, Tweet } from "../types";
import { Trash2, MessageSquare, Clock, Pencil, X, Check } from "lucide-react";



export const MyTweets: React.FC = () => {
  const [tweets, setTweets] = useState<Tweet[]>([]);
  const [loading, setLoading] = useState(false);

  // Edit States
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");

  const fetchMyTweets = useCallback(async () => {
    try {
      setLoading(true);
      const userRes = await api.get("/users/current-user");
      const userId = userRes.data.data._id;
      const { data } = await api.get<ApiResponse<PaginatedData<Tweet>>>(
        `/tweets/user/${userId}`,
      );
      setTweets(data.data.docs);
    } catch (err) {
      console.error("Error fetching tweets:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMyTweets();
  }, [fetchMyTweets]);

  const handleDeleteTweet = async (tweetId: string) => {
    if (!window.confirm("Delete this tweet permanently?")) return;
    try {
      // Hits deleteTweet controller
      await api.delete(`/tweets/${tweetId}`);
      setTweets((prev) => prev.filter((t) => t._id !== tweetId));
    } catch (err) {
      alert("Failed to delete tweet");
    }
  };

  const handleUpdateTweet = async (tweetId: string) => {
    if (!editContent.trim()) return;
    try {
      // Hits updateTweet controller
      await api.patch(`/tweets/${tweetId}`, { content: editContent });

      // Update local state and exit edit mode
      setTweets((prev) =>
        prev.map((t) =>
          t._id === tweetId ? { ...t, content: editContent } : t,
        ),
      );
      setEditingId(null);
    } catch (err) {
      alert("Failed to update tweet");
    }
  };

  if (loading && tweets.length === 0)
    return (
      <div className="p-8 text-center text-gray-500">
        Loading your tweets...
      </div>
    );

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
          <MessageSquare className="text-blue-600" /> My Tweets
        </h2>
        <span className="text-sm font-bold bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-3 py-1 rounded-full">
          {tweets.length} Posts
        </span>
      </div>

      <div className="space-y-4">
        {tweets.map((tweet) => (
          <div
            key={tweet._id}
            className="group bg-white dark:bg-[#1a1725] p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 hover:border-blue-200 dark:hover:border-blue-800 transition-all"
          >
            <div className="flex justify-between items-start gap-4">
              <div className="flex-1">
                {editingId === tweet._id ? (
                  // Edit Mode UI
                  <div className="space-y-3">
                    <textarea
                      className="w-full border-2 border-blue-100 dark:border-blue-900 bg-white dark:bg-[#13111C] p-3 rounded-xl focus:border-blue-400 outline-none h-24 dark:text-white"
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      autoFocus
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleUpdateTweet(tweet._id)}
                        className="flex items-center gap-1 bg-blue-600 text-white px-4 py-1.5 rounded-lg text-sm font-bold hover:bg-blue-700 transition"
                      >
                        <Check size={16} /> Save
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-4 py-1.5 rounded-lg text-sm font-bold hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                      >
                        <X size={16} /> Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  // View Mode UI
                  <>
                    <p className="text-gray-800 dark:text-gray-300 text-lg leading-relaxed whitespace-pre-wrap">
                      {tweet.content}
                    </p>
                    <div className="flex items-center gap-2 mt-4 text-gray-400 dark:text-gray-500 text-sm">
                      <Clock size={14} />
                      {new Date(tweet.createdAt).toLocaleDateString()}
                    </div>
                  </>
                )}
              </div>

              {/* Action Buttons (Visible when not editing) */}
              {!editingId && (
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  
                  <button
                    onClick={() => {
                      setEditingId(tweet._id);
                      setEditContent(tweet.content);
                    }}
                    className="p-2 text-gray-400 dark:text-gray-500 hover:text-blue-500 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full transition-colors"
                    title="Edit Tweet"
                  >
                    <Pencil size={18} />
                  </button>
                  <button
                    onClick={() => handleDeleteTweet(tweet._id)}
                    className="p-2 text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors"
                    title="Delete Tweet"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}

        {tweets.length === 0 && !loading && (
          <div className="text-center py-20 bg-gray-50 dark:bg-[#13111C] rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-800">
            <p className="text-gray-500 dark:text-gray-400">You haven't posted any tweets yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};
