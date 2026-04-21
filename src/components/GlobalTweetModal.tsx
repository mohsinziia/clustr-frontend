// src/components/GlobalTweetModal.tsx
import React, { useEffect, useState, useCallback } from 'react';
import { X, MessageCircle, Send, Heart, Share2, Edit3, Trash2 } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import type { Tweet } from '../types';

interface GlobalTweetModalProps {
    tweet: Tweet;
    onClose: () => void;
    onSync?: (updatedTweet: Tweet) => void; // Optional callback to sync with parent state
}

export const GlobalTweetModal: React.FC<GlobalTweetModalProps> = ({ tweet, onClose, onSync }) => {
    const { user: authUser } = useAuth();

    // Use local state for the tweet to handle optimistic UI updates independently of the parent prop
    const [currentTweet, setCurrentTweet] = useState<Tweet>(tweet);
    const [comments, setComments] = useState<any[]>([]);
    const [newComment, setNewComment] = useState("");

    // Comment management states
    const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
    const [editContent, setEditContent] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Fetch comments specific to this post
    const fetchComments = useCallback(async () => {
        try {
            const { data } = await api.get(`/comments/t/${tweet._id}`);
            setComments(data.data.docs || []);
        } catch (err) {
            console.error("Failed to load comments:", err);
        }
    }, [tweet._id]);

    useEffect(() => {
        fetchComments();
    }, [fetchComments]);

    useEffect(() => {
        if (onSync) onSync(currentTweet);
    }, [currentTweet, onSync]);

    // Handle Like/Unlike with strict state synchronization
    // src/components/GlobalTweetModal.tsx

    const handleToggleLike = async () => {
        try {
            const { data } = await api.post(`/likes/toggle/t/${currentTweet._id}`);

            if (data?.success) {
                // Match the video logic: Update count based on the boolean returned
                setCurrentTweet(prev => {
                    const newIsLiked = data.data.isLiked;
                    return {
                        ...prev,
                        isLiked: newIsLiked,
                        // If liked, +1; if unliked, -1.
                        likesCount: newIsLiked
                            ? (prev.likesCount || 0) + 1
                            : Math.max(0, (prev.likesCount || 0) - 1)
                    };
                });
            }
        } catch (err) {
            console.error("Like failed", err);
        }
    };

    // src/components/GlobalTweetModal.tsx

    const handleAddComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim() || isSubmitting) return;

        try {
            setIsSubmitting(true);
            const { data } = await api.post(`/comments/t/${currentTweet._id}`, {
                content: newComment
            });

            // 1. Define the variable properly
            const enrichedComment = {
                ...data.data,
                owner: {
                    _id: authUser?._id,
                    username: authUser?.username,
                    avatar: authUser?.avatar
                }
            };

            // 2. Use the correct variable name here
            setComments(prev => [enrichedComment, ...prev]);
            setNewComment("");

            // 3. Update the tweet state to trigger the feed sync
            setCurrentTweet(prev => ({
                ...prev,
                commentCount: (prev.commentCount || 0) + 1
            }));

        } catch (err) {
            console.error("Comment post failed:", err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUpdateComment = async (commentId: string) => {
        if (!editContent.trim()) return;
        try {
            const { data } = await api.patch(`/comments/t/c/${commentId}`, { content: editContent });
            setComments(prev => prev.map(c =>
                c._id === commentId ? { ...c, content: data.data.content } : c
            ));
            setEditingCommentId(null);
        } catch (err) {
            alert("Update failed");
        }
    };

    const handleDeleteComment = async (commentId: string) => {
        if (!window.confirm("Delete this reply?")) return;
        try {
            await api.delete(`/comments/t/c/${commentId}`);
            setComments(prev => prev.filter(c => c._id !== commentId));

            // SYNC: Decrement the comment count in the tweet state
            setCurrentTweet(prev => ({
                ...prev,
                commentCount: Math.max(0, (prev.commentCount || 0) - 1)
            }));

        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white/60 backdrop-blur-md p-0 md:p-4">
            <div className="bg-white w-full max-w-2xl h-full md:h-auto md:max-h-[90vh] md:rounded-3xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">

                {/* Header */}
                <div className="px-6 py-4 border-b flex items-center justify-between sticky top-0 bg-white/80 backdrop-blur-sm z-10">
                    <h3 className="font-black text-xl tracking-tight">Post</h3>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                    {/* Main Post Section */}
                    <div className="relative pb-6">
                        <div className="absolute left-[23px] top-14 bottom-0 w-0.5 bg-gray-100" />

                        <div className="flex gap-4">
                            <Link to={`/channel/${currentTweet.owner?.username}`} onClick={onClose}>
                                <img
                                    src={currentTweet.owner?.avatar?.url || currentTweet.owner?.avatar}
                                    className="w-12 h-12 rounded-full object-cover border border-gray-100 relative z-10 bg-white"
                                    alt=""
                                />
                            </Link>
                            <div className="flex-1">
                                <div className="flex items-center gap-2">
                                    <span className="font-bold text-gray-900">{currentTweet.owner?.fullName}</span>
                                    <span className="text-gray-400 text-sm">@{currentTweet.owner?.username}</span>
                                </div>
                                <p className="text-xl text-gray-800 mt-2 leading-relaxed whitespace-pre-wrap font-medium">
                                    {currentTweet.content}
                                </p>

                                <div className="flex items-center gap-6 mt-6 text-gray-400 border-y border-gray-50 py-3">
                                    <button
                                        onClick={handleToggleLike}
                                        className="flex items-center gap-2 hover:text-red-500 transition-colors group"
                                    >
                                        <Heart
                                            size={20}
                                            className={`${currentTweet.isLiked ? "fill-red-500 text-red-500" : "text-gray-400"} group-active:scale-125 transition-transform`}
                                        />
                                        <span className="text-sm font-bold">{currentTweet.likesCount || 0}</span>
                                    </button>
                                    <div className="flex items-center gap-2">
                                        <MessageCircle size={20} />
                                        <span className="text-sm font-bold">{comments.length}</span>
                                    </div>
                                    <Share2 size={18} className="hover:text-blue-500 cursor-pointer" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Reply Input */}
                    <div className="mt-4 flex gap-4">
                        <img src={authUser?.avatar?.url || authUser?.avatar} className="w-10 h-10 rounded-full object-cover shrink-0 bg-gray-100" alt="" />
                        <form onSubmit={handleAddComment} className="flex-1 relative">
                            <textarea
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                className="w-full bg-gray-50 border-none rounded-2xl px-4 py-3 text-[15px] focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                                placeholder="Post your reply"
                                rows={2}
                            />
                            <button
                                type="submit"
                                disabled={!newComment.trim() || isSubmitting}
                                className="absolute right-3 bottom-3 bg-blue-600 text-white p-2 rounded-xl disabled:opacity-50 shadow-lg shadow-blue-100 transition-all active:scale-90"
                            >
                                <Send size={16} />
                            </button>
                        </form>
                    </div>

                    {/* Replies Thread */}
                    <div className="mt-8 space-y-8">
                        {comments.map((c, index) => (
                            <div key={c._id} className="relative flex gap-4 group">
                                {index !== comments.length - 1 && (
                                    <div className="absolute left-[19px] top-12 bottom-[-32px] w-0.5 bg-gray-100" />
                                )}

                                <img
                                    src={c.owner?.avatar?.url || c.owner?.avatar}
                                    className="w-10 h-10 rounded-full object-cover border border-gray-100 relative z-10 bg-white"
                                    alt=""
                                />

                                <div className="flex-1 pb-2">
                                    {editingCommentId === c._id ? (
                                        <div className="space-y-2">
                                            <textarea
                                                className="w-full p-3 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500"
                                                value={editContent}
                                                onChange={(e) => setEditContent(e.target.value)}
                                                rows={2}
                                            />
                                            <div className="flex gap-2">
                                                <button onClick={() => handleUpdateComment(c._id)} className="bg-blue-600 text-white px-3 py-1 rounded-lg text-xs font-bold">Save</button>
                                                <button onClick={() => setEditingCommentId(null)} className="bg-gray-100 text-gray-600 px-3 py-1 rounded-lg text-xs font-bold">Cancel</button>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="flex justify-between items-start">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold text-sm text-gray-900">@{c.owner?.username}</span>
                                                    <span className="text-[10px] text-gray-400 font-bold uppercase">
                                                        {new Date(c.createdAt).toLocaleDateString()}
                                                    </span>
                                                </div>
                                                {authUser?._id === c.owner?._id && (
                                                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button onClick={() => { setEditingCommentId(c._id); setEditContent(c.content); }} className="p-1 hover:bg-blue-50 text-gray-400 hover:text-blue-500 rounded"><Edit3 size={14} /></button>
                                                        <button onClick={() => handleDeleteComment(c._id)} className="p-1 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded"><Trash2 size={14} /></button>
                                                    </div>
                                                )}
                                            </div>
                                            <p className="text-sm text-gray-700 mt-1 leading-relaxed">
                                                {c.content}
                                            </p>
                                        </>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};