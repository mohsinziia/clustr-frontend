import React, { useEffect, useState, useCallback } from "react";
import api from "../api/axios";
import type { Video, ApiResponse, PaginatedData } from "../types";
import { Play, X, Heart, MessageCircle, Share2 } from "lucide-react";

export const VideoFeed: React.FC = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchVideos = useCallback(async () => {
    try {
      setLoading(true);
      // Hits getAllVideos in video.controller.js
      const { data } = await api.get<ApiResponse<PaginatedData<Video>>>(
        "/videos?page=1&limit=12",
      );
      setVideos(data.data.docs);
    } catch (err) {
      console.error("Could not fetch feed:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVideos();
  }, [fetchVideos]);

  const handleLikeToggle = async (e: React.MouseEvent, videoId: string) => {
    e.stopPropagation(); // Prevents the video player from opening when clicking like
    try {
      // Hits toggleVideoLike in like.controller.js
      await api.post(`/likes/toggle/v/${videoId}`);

      // Refresh feed to show updated counts or UI feedback
      // For a Database Project, this shows real-time document updates
      fetchVideos();
    } catch (err) {
      console.error("Like action failed:", err);
    }
  };

  if (loading && videos.length === 0) {
    return (
      <div className="flex justify-center items-center h-64 text-gray-500 font-medium">
        Loading your feed...
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-8 text-gray-800">Explore Videos</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {videos.map((video) => (
          <div
            key={video._id}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden group hover:shadow-xl transition-all duration-300"
          >
            {/* Thumbnail & Play Overlay */}
            <div
              className="relative cursor-pointer aspect-video"
              onClick={() => setSelectedVideo(video)}
            >
              <img
                src={video.thumbnail.url}
                alt={video.title}
                className="w-full h-full object-cover transition duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30">
                <div className="bg-blue-600 p-4 rounded-full shadow-lg">
                  <Play className="text-white fill-white" size={32} />
                </div>
              </div>
              <span className="absolute bottom-3 right-3 bg-black/80 text-white text-xs font-bold px-2 py-1 rounded-md">
                {Math.floor(video.duration / 60)}:
                {(video.duration % 60).toString().padStart(2, "0")}
              </span>
            </div>

            {/* Content & Interactions */}
            <div className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-900 text-lg truncate leading-tight mb-1">
                    {video.title}
                  </h3>
                  <p className="text-sm text-gray-500 font-medium flex items-center gap-1">
                    <span className="hover:text-blue-600 cursor-pointer">
                      @{video.owner?.username}
                    </span>
                    <span>•</span>
                    <span>{video.views} views</span>
                  </p>
                </div>

                {/* Social Actions Component */}
                <div className="flex flex-col items-center gap-1">
                  <button
                    onClick={(e) => handleLikeToggle(e, video._id)}
                    className="p-2 rounded-full hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <Heart
                      size={22}
                      className="transition-transform active:scale-125"
                    />
                  </button>
                  <span className="text-[10px] font-black text-gray-400 uppercase">
                    Like
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-50 flex justify-between">
                <button className="text-gray-400 hover:text-blue-600 flex items-center gap-1 text-sm font-semibold">
                  <MessageCircle size={18} />
                  Comment
                </button>
                <button className="text-gray-400 hover:text-green-600 flex items-center gap-1 text-sm font-semibold">
                  <Share2 size={18} />
                  Share
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Global Video Player Modal */}
      {selectedVideo && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-md z-[100] flex items-center justify-center p-4 md:p-10">
          <button
            className="absolute top-6 right-6 text-white/70 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-full"
            onClick={() => setSelectedVideo(null)}
          >
            <X size={36} />
          </button>

          <div className="w-full max-w-5xl animate-in zoom-in-95 duration-300">
            <div className="bg-black rounded-2xl overflow-hidden shadow-2xl border border-white/10">
              <video
                controls
                autoPlay
                className="w-full aspect-video"
                src={selectedVideo.videoFile.url}
              >
                Your browser does not support the video tag.
              </video>
            </div>

            <div className="mt-6 text-white px-2">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-3xl font-extrabold tracking-tight">
                    {selectedVideo.title}
                  </h2>
                  <p className="text-blue-400 font-semibold mt-1">
                    Uploaded by @{selectedVideo.owner?.username}
                  </p>
                </div>
                <div className="flex gap-4">
                  <button
                    onClick={(e) => handleLikeToggle(e, selectedVideo._id)}
                    className="flex flex-col items-center gap-1 group"
                  >
                    <Heart
                      className="group-hover:text-red-500 transition-colors"
                      size={28}
                    />
                    <span className="text-xs font-bold text-gray-400">
                      LIKE
                    </span>
                  </button>
                </div>
              </div>
              <div className="mt-4 p-4 bg-white/5 rounded-xl border border-white/5">
                <p className="text-gray-300 leading-relaxed">
                  {selectedVideo.description}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {videos.length === 0 && !loading && (
        <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-200">
          <p className="text-gray-500 text-lg">
            The feed is empty. Start by uploading a video!
          </p>
        </div>
      )}
    </div>
  );
};
