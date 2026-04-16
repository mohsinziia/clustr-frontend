import React, { useEffect, useState, useCallback } from 'react';
import api from '../api/axios';
import type { Video, ApiResponse, PaginatedData } from '../types';
import { useVideoPlayer } from './VideoPlayerContext';
import { VideoCard } from './VideoCard';
import { useAuth } from '../context/AuthContext';
import { API_LIMITS } from '../constants';
import { VideoSkeleton } from './Skeletons';

export const VideoFeed: React.FC = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);

  const { playVideo } = useVideoPlayer();
  const { user: authUser } = useAuth();

  const fetchVideos = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await api.get<ApiResponse<PaginatedData<Video>>>(
        `/videos?page=1&limit=${API_LIMITS.VIDEOS_PER_PAGE}`
      );
      setVideos(data.data.docs);
    } catch (err) {
      console.error("Feed Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVideos();
  }, [fetchVideos]);

  if (loading) return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="h-8 bg-gray-200 rounded-lg w-48 mb-8 animate-pulse" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {[...Array(6)].map((_, i) => <VideoSkeleton key={i} />)}
      </div>
    </div>
  );

  if (videos.length === 0) return (
    <div className="text-center p-20 text-gray-400 italic">
      No videos found. Be the first to upload!
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h2 className="text-2xl font-black text-gray-900 mb-8 tracking-tight">Explore Videos</h2>

      {/* The Grid Container */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {videos.map(v => (
          <VideoCard
            key={v._id}
            video={v}
            onClick={() => playVideo(v)}
            isOwner={authUser?._id === v.owner?._id}
          />
        ))}
      </div>
    </div>
  );
};