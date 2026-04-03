import React, { useEffect, useState, useCallback } from "react";
import api from "../api/axios";
import type { Video, ApiResponse, PaginatedData } from "../types";
import { Pencil, Trash2, X, Play } from "lucide-react";

export const MyVideos: React.FC = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [editingVideo, setEditingVideo] = useState<Video | null>(null);
  const [previewVideo, setPreviewVideo] = useState<Video | null>(null); // New state for playback
  const [editData, setEditData] = useState({ title: "", description: "" });
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchVideos = useCallback(async () => {
    try {
      setLoading(true);
      const userRes = await api.get("/users/current-user");
      const userId = userRes.data.data._id;
      const { data } = await api.get<ApiResponse<PaginatedData<Video>>>(
        `/videos?userId=${userId}`,
      );
      setVideos(data.data.docs);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVideos();
  }, [fetchVideos]);

  const handleDelete = async (videoId: string) => {
    if (!window.confirm("Delete this video permanently?")) return;
    try {
      await api.delete(`/videos/${videoId}`);
      setVideos((prev) => prev.filter((v) => v._id !== videoId));
    } catch (err) {
      alert("Error deleting video");
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVideo) return;

    const formData = new FormData();
    formData.append("title", editData.title);
    formData.append("description", editData.description);
    if (thumbnail) formData.append("thumbnail", thumbnail);

    try {
      await api.patch(`/videos/${editingVideo._id}`, formData);
      setEditingVideo(null);
      fetchVideos();
    } catch (err) {
      alert("Update failed");
    }
  };

  if (loading && videos.length === 0)
    return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold text-gray-800 mb-8">
        My Content Library
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {videos.map((video) => (
          <div
            key={video._id}
            className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden group"
          >
            {/* Thumbnail Container with Play Overlay */}
            <div
              className="relative cursor-pointer aspect-video"
              onClick={() => setPreviewVideo(video)}
            >
              <img
                src={video.thumbnail.url}
                className="w-full h-full object-cover transition group-hover:opacity-80"
                alt={video.title}
              />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
                <Play className="text-white fill-white" size={48} />
              </div>
              <span className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                {Math.floor(video.duration / 60)}:
                {(video.duration % 60).toString().padStart(2, "0")}
              </span>
            </div>

            <div className="p-4">
              <h3 className="font-bold text-gray-900 truncate mb-4">
                {video.title}
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setEditingVideo(video);
                    setEditData({
                      title: video.title,
                      description: video.description,
                    });
                  }}
                  className="flex-1 flex items-center justify-center gap-2 bg-gray-50 text-blue-600 py-2 rounded-lg hover:bg-blue-50 transition font-medium"
                >
                  <Pencil size={16} /> Edit
                </button>
                <button
                  onClick={() => handleDelete(video._id)}
                  className="flex-1 flex items-center justify-center gap-2 bg-gray-50 text-red-600 py-2 rounded-lg hover:bg-red-50 transition font-medium"
                >
                  <Trash2 size={16} /> Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Video Player Modal */}
      {previewVideo && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 z-[60]">
          <button
            onClick={() => setPreviewVideo(null)}
            className="absolute top-6 right-6 text-white hover:text-gray-300 transition"
          >
            <X size={32} />
          </button>
          <div className="w-full max-w-5xl">
            <video
              src={previewVideo.videoFile.url}
              controls
              autoPlay
              className="w-full rounded-lg shadow-2xl border border-white/10"
            />
            <div className="mt-4 text-white">
              <h2 className="text-2xl font-bold">{previewVideo.title}</h2>
              <p className="text-gray-400 mt-1">{previewVideo.description}</p>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal Logic (Same as before) */}
      {editingVideo && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <form
            onSubmit={handleUpdate}
            className="bg-white p-6 rounded-2xl w-full max-w-md shadow-2xl"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Update Video</h2>
              <button
                type="button"
                onClick={() => setEditingVideo(null)}
                className="text-gray-400"
              >
                <X />
              </button>
            </div>
            <input
              className="w-full border p-3 mb-4 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              value={editData.title}
              onChange={(e) =>
                setEditData({ ...editData, title: e.target.value })
              }
              placeholder="Title"
              required
            />
            <textarea
              className="w-full border p-3 mb-4 rounded-xl h-32 focus:ring-2 focus:ring-blue-500 outline-none"
              value={editData.description}
              onChange={(e) =>
                setEditData({ ...editData, description: e.target.value })
              }
              placeholder="Description"
              required
            />
            <div className="mb-6">
              <label className="text-sm font-bold text-gray-600 block mb-2">
                New Thumbnail (Optional)
              </label>
              <input
                type="file"
                onChange={(e) => setThumbnail(e.target.files?.[0] || null)}
                className="w-full text-sm"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition"
            >
              Save Changes
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
