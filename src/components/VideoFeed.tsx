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
  
  // Listen for global video like/comment changes
  useEffect(() => {
    const handleLikeChange = (e: any) => {
      setVideos(prev => prev.map(v => 
        v._id === e.detail.videoId 
        ? { ...v, isLiked: e.detail.isLiked, likesCount: e.detail.likesCount } 
        : v
      ));
    };

    const handleCommentChange = (e: any) => {
      setVideos(prev => prev.map(v => 
        v._id === e.detail.videoId 
        ? { ...v, commentCount: e.detail.commentCount } 
        : v
      ));
    };

    window.addEventListener('videoLikeChange', handleLikeChange);
    window.addEventListener('videoCommentChange', handleCommentChange);
    return () => {
      window.removeEventListener('videoLikeChange', handleLikeChange);
      window.removeEventListener('videoCommentChange', handleCommentChange);
    };
  }, []);

  const handleToggleLike = async (videoId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const { data } = await api.post(`/likes/toggle/v/${videoId}`);
      const newIsLiked = data.data.isLiked;

      const videoToUpdate = videos.find(v => v._id === videoId);
      if (!videoToUpdate) return;

      const newCount = newIsLiked 
        ? (videoToUpdate.likesCount || 0) + 1 
        : Math.max(0, (videoToUpdate.likesCount || 0) - 1);

      // Broadcast correct count
      window.dispatchEvent(new CustomEvent('videoLikeChange', {
        detail: { videoId, isLiked: newIsLiked, likesCount: newCount }
      }));

      // Update local state
      setVideos(prev => prev.map(v => 
        v._id === videoId 
        ? { ...v, isLiked: newIsLiked, likesCount: newCount } 
        : v
      ));
    } catch (err) {
      console.error("Like failed", err);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, [fetchVideos]);

  if (loading) return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded-lg w-48 mb-8 animate-pulse" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {[...Array(6)].map((_, i) => <VideoSkeleton key={i} />)}
      </div>
    </div>
  );

  if (videos.length === 0) return (
    <div className="text-center p-20 text-gray-400 dark:text-gray-500 italic">
      No videos found. Be the first to upload!
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-8 tracking-tight">Explore Videos</h2>

      {/* The Grid Container */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {videos.map(v => (
          <VideoCard
            key={v._id}
            video={v}
            onClick={() => playVideo(v)}
            isOwner={authUser?._id === v.owner?._id}
            onToggleLike={handleToggleLike}
          />
        ))}
      </div>
    </div>
  );
};