import React, { useEffect, useState, useCallback } from "react";
import api from "../api/axios";
import type { Video, ApiResponse, PaginatedData } from "../types";
import { Pencil, Trash2, X, Play, Upload, Film } from "lucide-react";

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
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Film className="text-blue-600" /> My Uploaded Content
        </h2>
        <div className="text-sm text-gray-400 font-medium">
          {videos.length} Videos Total
        </div>
      </div>

      {/* Video Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {videos.map(video => (
          <div key={video._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden group hover:shadow-md transition-all">
            <div 
              className="relative aspect-video cursor-pointer"
              onClick={() => setPreviewVideo(video)}
            >
              <img src={video.thumbnail.url} className="w-full h-full object-cover transition group-hover:opacity-90" alt={video.title} />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
                <div className="bg-white/20 backdrop-blur-md p-3 rounded-full">
                  <Play className="text-white fill-white" size={32} />
                </div>
              </div>
            </div>

            <div className="p-4">
              <h3 className="font-bold text-gray-900 truncate mb-4">{video.title}</h3>
              <div className="flex gap-2">
                <button 
                  onClick={() => {
                    setEditingVideo(video);
                    setEditData({ title: video.title, description: video.description });
                  }}
                  className="flex-1 flex items-center justify-center gap-2 bg-blue-50 text-blue-600 py-2.5 rounded-xl hover:bg-blue-100 transition font-semibold text-sm"
                >
                  <Pencil size={16} /> Edit
                </button>
                <button 
                  onClick={() => handleDelete(video._id)}
                  className="flex-1 flex items-center justify-center gap-2 bg-red-50 text-red-600 py-2.5 rounded-xl hover:bg-red-100 transition font-semibold text-sm"
                >
                  <Trash2 size={16} /> Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Modal */}
      {editingVideo && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <form onSubmit={handleUpdate} className="bg-white p-8 rounded-3xl w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800">Edit Video Details</h2>
              <button type="button" onClick={() => setEditingVideo(null)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-bold text-gray-600 block mb-1.5">Title</label>
                <input 
                  className="w-full border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition" 
                  value={editData.title} 
                  onChange={e => setEditData({...editData, title: e.target.value})} 
                  required 
                />
              </div>

              <div>
                <label className="text-sm font-bold text-gray-600 block mb-1.5">Description</label>
                <textarea 
                  className="w-full border border-gray-200 p-3 rounded-xl h-32 focus:ring-2 focus:ring-blue-500 outline-none transition resize-none" 
                  value={editData.description} 
                  onChange={e => setEditData({...editData, description: e.target.value})} 
                  required 
                />
              </div>

              {/* STYLED FILE BUTTON SECTION */}
              <div className="pt-2">
                <label className="text-sm font-bold text-gray-600 block mb-2">Thumbnail Image</label>
                <div className="flex items-center gap-3">
                  <input 
                    type="file" 
                    id="edit-thumbnail" 
                    className="hidden" 
                    accept="image/*"
                    onChange={e => setThumbnail(e.target.files?.[0] || null)} 
                  />
                  <label 
                    htmlFor="edit-thumbnail"
                    className="cursor-pointer bg-gray-100 text-gray-700 px-5 py-2.5 rounded-xl border border-gray-200 hover:bg-gray-200 transition font-bold text-sm flex items-center gap-2"
                  >
                    <Upload size={18} />
                    {thumbnail ? "Change Selected" : "Choose New File"}
                  </label>
                  {thumbnail && (
                    <span className="text-xs text-blue-600 font-medium truncate max-w-[120px]">
                      {thumbnail.name}
                    </span>
                  )}
                </div>
              </div>

              <button 
                type="submit" 
                className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 mt-4"
              >
                Save All Changes
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Preview Player Modal */}
      {previewVideo && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-[60]">
          <button onClick={() => setPreviewVideo(null)} className="absolute top-6 right-6 text-white hover:text-gray-300">
            <X size={32} />
          </button>
          <div className="w-full max-w-5xl">
            <video src={previewVideo.videoFile.url} controls autoPlay className="w-full rounded-2xl shadow-2xl" />
            <h2 className="text-white text-2xl font-bold mt-6">{previewVideo.title}</h2>
          </div>
        </div>
      )}
    </div>
  );
};
