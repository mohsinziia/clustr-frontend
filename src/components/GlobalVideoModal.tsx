import React, { useEffect, useRef, useState } from 'react';
import { X, MessageCircle, Heart, Send, Edit3, Trash2 } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { ChannelInfo } from './ChannelInfo';
import type { Video } from '../types';
import { Link, useLocation } from 'react-router-dom';
import { useVideoPlayer } from './VideoPlayerContext';

interface GlobalVideoModalProps {
    video: Video;
    onClose: () => void;
}

export const GlobalVideoModal: React.FC<GlobalVideoModalProps> = ({ video, onClose }) => {
    const { user: authUser } = useAuth();

    // States
    const [comments, setComments] = useState<any[]>([]);
    const [newComment, setNewComment] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [currentOwner, setCurrentOwner] = useState(video.owner);
    const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
    const [editCommentContent, setEditCommentContent] = useState("");
    const { closeVideo } = useVideoPlayer();
    const locaion = useLocation();

    const initialPath = useRef(location.pathname);

    useEffect(() => {
        // Only close if the current path is different from the opening path
        if (location.pathname !== initialPath.current) {
            closeVideo();
            onClose();
        }
    }, [location.pathname, closeVideo, onClose]);

    // Fetch Comments on Mount
    useEffect(() => {
        let isMounted = true;

        const fetchComments = async (isSilent = false) => {
            if (!video?._id) return;
            try {
                // Adding a timestamp ensures the URL is unique every time
                const { data } = await api.get(`/comments/${video._id}?t=${new Date().getTime()}`);

                if (isMounted) {
                    setComments(data.data.docs || []);
                }
            } catch (err) {
                console.error("Sync failed:", err);
            }
        };

        // Initial fetch when the modal opens
        fetchComments();

        // POLLING: Ask the server for fresh data every 15 seconds
        const syncInterval = setInterval(() => {
            fetchComments(true);
        }, 15000);

        return () => {
            isMounted = false;
            clearInterval(syncInterval);
        };
    }, [video?._id]);

    // --- HANDLERS ---

    const handleAddComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim() || !authUser) return;
        try {
            setIsSubmitting(true);
            const { data } = await api.post(`/comments/${video._id}`, { content: newComment });
            const enriched = {
                ...data.data,
                owner: { _id: authUser._id, username: authUser.username, avatar: authUser.avatar }
            };
            setComments(prev => [enriched, ...prev]);
            setNewComment("");
        } catch (err) {
            console.error("Post Comment Error:", err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleModalSubscribe = async (channelId: string) => {
        try {
            await api.post(`/subscriptions/c/${channelId}`);
            setCurrentOwner(prev => ({
                ...prev,
                isSubscribed: !prev.isSubscribed,
                subscribersCount: (prev.subscribersCount ?? 0) + (prev.isSubscribed ? -1 : 1)
            }));
        } catch (err) {
            console.error("Sub Toggle Error:", err);
        }
    };

    const handleToggleCommentLike = async (commentId: string) => {
        // 1. Optimistic Update (Immediate feedback for the clicking user)
        setComments(prev => prev.map(c => {
            if (c._id === commentId) {
                const currentlyLiked = c.isLiked;
                return {
                    ...c,
                    isLiked: !currentlyLiked,
                    likesCount: currentlyLiked ? (c.likesCount || 1) - 1 : (c.likesCount || 0) + 1
                };
            }
            return c;
        }));

        try {
            // 2. Persistent Update (Notifies the server)
            await api.post(`/likes/toggle/c/${commentId}`);
        } catch (err) {
            console.error("Like failed, syncing data...");
            // If the API fails, the next poll will automatically fix the UI
        }
    };

    const handleDeleteComment = async (commentId: string) => {
        if (!window.confirm("Delete comment?")) return;
        try {
            await api.delete(`/comments/c/${commentId}`);
            setComments(prev => prev.filter(c => c._id !== commentId));
        } catch (err) { console.error(err); }
    };

    const handleNavigation = () => {
        closeVideo(); // Clears activeVideo in context
        onClose();    // Triggers the onClose prop passed from the Provider
    };

    // --- RENDER ---

    return (
        // z-[9999] ensures it's above Sidebar/Nav. inset-0 + fixed ensures it fills the screen.
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/95 backdrop-blur-sm p-4 lg:p-10">

            {/* Close Button */}
            <button
                onClick={onClose}
                className="absolute top-4 right-4 lg:top-8 lg:right-8 text-white/70 hover:text-white bg-white/10 p-3 rounded-full z-[10000] transition-all"
            >
                <X size={28} />
            </button>

            <div className="flex flex-col lg:flex-row w-full max-w-7xl h-full max-h-[90vh] bg-[#0f0f0f] rounded-3xl overflow-hidden shadow-2xl border border-white/10">

                {/* 1. LEFT: Video Player (Takes 2/3 of space on desktop) */}
                <div className="flex-[2] bg-black flex items-center justify-center relative border-b lg:border-b-0 lg:border-r border-white/5">
                    <video
                        src={video.videoFile.url}
                        controls
                        className="w-full h-full max-h-[50vh] lg:max-h-full object-contain"
                    />
                </div>

                {/* 2. RIGHT: Sidebar (Takes 1/3 of space) */}
                <div className="flex-1 min-w-[350px] flex flex-col h-full bg-[#0f0f0f]">

                    {/* Sidebar Header */}
                    <div className="p-6 border-b border-white/5">
                        <h2 className="text-xl font-bold text-white mb-4 line-clamp-2">{video.title}</h2>
                        <ChannelInfo
                            owner={currentOwner}
                            onSubscribe={handleModalSubscribe}
                            variant="dark"
                        />
                    </div>

                    {/* Scrollable Content */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">

                        {/* Description Section */}
                        <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                            <div className="flex justify-between text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">
                                <span>{video.views?.toLocaleString()} Views</span>
                                <span>{new Date(video.createdAt).toLocaleDateString()}</span>
                            </div>
                            <p className="text-sm text-gray-400 leading-relaxed whitespace-pre-wrap">{video.description}</p>
                        </div>

                        {/* Comment Form */}
                        <div className="space-y-4">
                            <h3 className="text-white font-black text-xs uppercase tracking-tighter flex items-center gap-2">
                                <MessageCircle size={16} className="text-blue-500" /> Discussion
                            </h3>
                            <form onSubmit={handleAddComment} className="flex gap-2">
                                <input
                                    type="text"
                                    placeholder="Write a comment..."
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:border-blue-500 outline-none"
                                />
                                <button
                                    type="submit"
                                    disabled={isSubmitting || !newComment.trim()}
                                    className="bg-blue-600 text-white p-2 rounded-xl disabled:opacity-50"
                                >
                                    <Send size={18} />
                                </button>
                            </form>
                        </div>

                        {/* Comments List */}
                        <div className="space-y-6">
                            {comments.map((comment) => (
                                <div key={comment._id} className="flex gap-3 group">
                                    <img src={comment.owner?.avatar} className="w-8 h-8 rounded-full bg-gray-800 object-cover shrink-0" alt="" />
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-1">
                                            <Link
                                                to={`/channel/${comment.owner?.username}`}
                                                onClick={handleNavigation}
                                                className="text-xs font-bold text-white hover:text-blue-400 transition-colors"
                                            >
                                                @{comment.owner?.username}
                                            </Link>
                                        </div>
                                        <p className="text-sm text-gray-400">{comment.content}</p>
                                        <button
                                            onClick={() => handleToggleCommentLike(comment._id)}
                                            className="flex items-center gap-1.5 mt-2 group/like"
                                        >
                                            <Heart
                                                size={12}
                                                className={comment.isLiked ? "text-red-500 fill-current" : "text-gray-600 group-hover/like:text-red-400"}
                                            />
                                            <span className={`text-[10px] font-bold ${comment.isLiked ? "text-red-500" : "text-gray-600"}`}>
                                                {comment.likesCount || 0}
                                            </span>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};