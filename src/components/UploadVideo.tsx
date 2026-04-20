import React, { useState } from "react";
import api from "../api/axios";
import { Video as VideoIcon, MessageSquare } from "lucide-react";

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
      alert("Video Published!");
    } catch (err) {
      alert("Upload failed");
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
      alert("Tweet Posted!");
    } catch (err) {
      alert("Tweet failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-sm border p-6">
      <div className="flex gap-4 mb-8 border-b pb-4">
        <button
          onClick={() => setActiveTab("video")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold ${activeTab === "video" ? "bg-blue-600 text-white" : "text-gray-500"}`}
        >
          <VideoIcon size={20} /> Video
        </button>
        <button
          onClick={() => setActiveTab("tweet")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold ${activeTab === "tweet" ? "bg-blue-600 text-white" : "text-gray-500"}`}
        >
          <MessageSquare size={20} /> Tweet
        </button>
      </div>

      {activeTab === "video" ? (
        <form onSubmit={handleVideoUpload} className="space-y-4">
          <input
            className="w-full border p-3 rounded-lg"
            placeholder="Video Title"
            onChange={(e) =>
              setVideoData({ ...videoData, title: e.target.value })
            }
            required
          />
          <textarea
            className="w-full border p-3 rounded-lg"
            placeholder="Description"
            onChange={(e) =>
              setVideoData({ ...videoData, description: e.target.value })
            }
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold mb-2 text-gray-700">Video File</label>
              <input
                type="file"
                accept="video/*"
                onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
                required
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 file:cursor-pointer cursor-pointer border border-gray-200 rounded-lg p-2 bg-gray-50"
              />
            </div>
            <div>
              <label className="block text-sm font-bold mb-2 text-gray-700">Thumbnail</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setThumbnail(e.target.files?.[0] || null)}
                required
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 file:cursor-pointer cursor-pointer border border-gray-200 rounded-lg p-2 bg-gray-50"
              />
            </div>
          </div>
          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="isPublished"
              checked={videoData.isPublished}
              onChange={(e) => setVideoData({ ...videoData, isPublished: e.target.checked })}
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 border-gray-300 cursor-pointer"
            />
            <label htmlFor="isPublished" className="text-sm font-bold text-gray-700 cursor-pointer">
              Publish video immediately (uncheck to save as draft)
            </label>
          </div>
          <button
            disabled={loading}
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold"
          >
            {loading ? "Uploading..." : "Publish Video"}
          </button>
        </form>
      ) : (
        <form onSubmit={handleTweetSubmit} className="space-y-4">
          <textarea
            className="w-full border p-3 rounded-lg h-32 focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="What's happening?"
            value={tweetContent}
            onChange={(e) => setTweetContent(e.target.value)}
            required
          />
          <button
            disabled={loading}
            type="submit"
            className="w-full bg-black text-white py-3 rounded-lg font-bold"
          >
            {loading ? "Posting..." : "Post Tweet"}
          </button>
        </form>
      )}
    </div>
  );
};
