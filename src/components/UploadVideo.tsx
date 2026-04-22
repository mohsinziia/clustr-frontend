import React, { useState } from "react";
import api from "../api/axios";
import { Video as VideoIcon, MessageSquare } from "lucide-react";
import { toast } from "sonner";

export const UploadVideo = () => {
  const [activeTab, setActiveTab] = useState<"video" | "tweet">("video");
  const [loading, setLoading] = useState(false);

  // Video State
  const [videoData, setVideoData] = useState({ title: "", description: "", isPublished: true });
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [thumbnail, setThumbnail] = useState<File | null>(null);

  // Tweet State
  const [tweetContent, setTweetContent] = useState("");

  const handleVideoUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData();
    formData.append("title", videoData.title);
    formData.append("description", videoData.description);
    formData.append("isPublished", String(videoData.isPublished));
    if (videoFile) formData.append("videoFile", videoFile);
    if (thumbnail) formData.append("thumbnail", thumbnail);

    try {
      await api.post("/videos", formData);
      toast.success("Video Published successfully!");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Video upload failed");
    } finally {
      setLoading(false);
    }
  };

  const handleTweetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Matches createTweet in tweet.controller.js
      await api.post("/tweets", { content: tweetContent });
      setTweetContent("");
      toast.success("Tweet Posted successfully!");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Tweet failed to post");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white dark:bg-[#1a1725] rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6 transition-colors">
      <div className="flex gap-4 mb-8 border-b dark:border-gray-800 pb-4">
        <button
          onClick={() => setActiveTab("video")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition-all ${activeTab === "video" ? "bg-blue-600 text-white shadow-md dark:shadow-blue-900/20" : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#13111C]"}`}
        >
          <VideoIcon size={20} /> Video
        </button>
        <button
          onClick={() => setActiveTab("tweet")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition-all ${activeTab === "tweet" ? "bg-blue-600 text-white shadow-md dark:shadow-blue-900/20" : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#13111C]"}`}
        >
          <MessageSquare size={20} /> Tweet
        </button>
      </div>

      {activeTab === "video" ? (
        <form onSubmit={handleVideoUpload} className="space-y-4">
          <input
            className="w-full border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#13111C] p-3 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 dark:text-white transition-all"
            placeholder="Video Title"
            onChange={(e) =>
              setVideoData({ ...videoData, title: e.target.value })
            }
            required
          />
          <textarea
            className="w-full border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#13111C] p-3 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 dark:text-white transition-all resize-none h-32"
            placeholder="Description"
            onChange={(e) =>
              setVideoData({ ...videoData, description: e.target.value })
            }
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold mb-2 text-gray-700 dark:text-gray-300">Video File</label>
              <input
                type="file"
                accept="video/*"
                onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
                required
                className="block w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-bold file:bg-blue-50 dark:file:bg-blue-900/20 file:text-blue-700 dark:file:text-blue-400 hover:file:bg-blue-100 dark:hover:file:bg-blue-900/30 file:cursor-pointer cursor-pointer border border-gray-200 dark:border-gray-800 rounded-lg p-2 bg-gray-50 dark:bg-[#13111C] transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-bold mb-2 text-gray-700 dark:text-gray-300">Thumbnail</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setThumbnail(e.target.files?.[0] || null)}
                required
                className="block w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-bold file:bg-blue-50 dark:file:bg-blue-900/20 file:text-blue-700 dark:file:text-blue-400 hover:file:bg-blue-100 dark:hover:file:bg-blue-900/30 file:cursor-pointer cursor-pointer border border-gray-200 dark:border-gray-800 rounded-lg p-2 bg-gray-50 dark:bg-[#13111C] transition-all"
              />
            </div>
          </div>
          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="isPublished"
              checked={videoData.isPublished}
              onChange={(e) => setVideoData({ ...videoData, isPublished: e.target.checked })}
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 border-gray-300 dark:border-gray-700 bg-white dark:bg-[#13111C] cursor-pointer"
            />
            <label htmlFor="isPublished" className="text-sm font-bold text-gray-700 dark:text-gray-300 cursor-pointer">
              Publish video immediately (uncheck to save as draft)
            </label>
          </div>
          <button
            disabled={loading}
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-bold shadow-lg shadow-blue-200 dark:shadow-blue-900/20 transition-all active:scale-95 disabled:opacity-50"
          >
            {loading ? "Uploading..." : "Publish Video"}
          </button>
        </form>
      ) : (
        <form onSubmit={handleTweetSubmit} className="space-y-4">
          <textarea
            className="w-full border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#13111C] p-3 rounded-lg h-32 focus:ring-2 focus:ring-blue-500 outline-none dark:text-white transition-all resize-none"
            placeholder="What's happening?"
            value={tweetContent}
            onChange={(e) => setTweetContent(e.target.value)}
            required
          />
          <button
            disabled={loading}
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-bold shadow-lg shadow-blue-200 dark:shadow-blue-900/20 transition-all active:scale-95 disabled:opacity-50"
          >
            {loading ? "Posting..." : "Post Tweet"}
          </button>
        </form>
      )}
    </div>
  );
};
