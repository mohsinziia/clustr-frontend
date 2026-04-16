import React, { useEffect, useState } from 'react';
import { X, MessageCircle, Send, Heart, Share2 } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

export const GlobalTweetModal = ({ tweet, onClose }) => {
    const { user: authUser } = useAuth();
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState("");

    useEffect(() => {
        const fetchComments = async () => {
            try {
                // Fetching comments specifically for this tweet
                const { data } = await api.get(`/comments/t/${tweet._id}`);
                setComments(data.data.docs || []);
            } catch (err) { console.error(err); }
        };
        fetchComments();
    }, [tweet._id]);

    const handleAddComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim()) return;
        try {
            const { data } = await api.post(`/comments/t/${tweet._id}`, { content: newComment });
            const enriched = {
                ...data.data,
                owner: { _id: authUser?._id, username: authUser?.username, avatar: authUser?.avatar }
            };
            setComments(prev => [enriched, ...prev]);
            setNewComment("");
        } catch (err) { console.error(err); }
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
                        {/* Thread Line connecting to replies */}
                        <div className="absolute left-[23px] top-14 bottom-0 w-0.5 bg-gray-100" />

                        <div className="flex gap-4">
                            <Link to={`/channel/${tweet.owner?.username}`} onClick={onClose}>
                                <img
                                    src={tweet.owner?.avatar?.url || tweet.owner?.avatar}
                                    className="w-12 h-12 rounded-full object-cover border border-gray-100 relative z-10 bg-white"
                                    alt=""
                                />
                            </Link>
                            <div className="flex-1">
                                <div className="flex items-center gap-2">
                                    <span className="font-bold text-gray-900">{tweet.owner?.fullName}</span>
                                    <span className="text-gray-400 text-sm">@{tweet.owner?.username}</span>
                                </div>
                                <p className="text-xl text-gray-800 mt-2 leading-relaxed whitespace-pre-wrap">
                                    {tweet.content}
                                </p>

                                <div className="flex items-center gap-6 mt-6 text-gray-400 border-y border-gray-50 py-3">
                                    <button className="flex items-center gap-2 hover:text-red-500 transition-colors">
                                        <Heart size={20} className={tweet.isLiked ? "fill-red-500 text-red-500" : ""} />
                                        <span className="text-sm font-bold">{tweet.likesCount || 0}</span>
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

                    {/* Quick Reply Box */}
                    <div className="mt-4 flex gap-4">
                        <img src={authUser?.avatar?.url || authUser?.avatar} className="w-10 h-10 rounded-full object-cover shrink-0" alt="" />
                        <form onSubmit={handleAddComment} className="flex-1 relative">
                            <textarea
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                className="w-full bg-gray-50 border-none rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                                placeholder="Post your reply"
                                rows={2}
                            />
                            <button
                                type="submit"
                                disabled={!newComment.trim()}
                                className="absolute right-3 bottom-3 bg-blue-600 text-white p-2 rounded-xl disabled:opacity-50 shadow-lg shadow-blue-100 transition-all active:scale-90"
                            >
                                <Send size={16} />
                            </button>
                        </form>
                    </div>

                    {/* Replies List */}
                    <div className="mt-8 space-y-8">
                        {comments.map((c, index) => (
                            <div key={c._id} className="relative flex gap-4">
                                {index !== comments.length - 1 && (
                                    <div className="absolute left-[19px] top-12 bottom-[-32px] w-0.5 bg-gray-100" />
                                )}
                                <img
                                    src={c.owner?.avatar?.url || c.owner?.avatar}
                                    className="w-10 h-10 rounded-full object-cover border border-gray-100 relative z-10 bg-white"
                                    alt=""
                                />
                                <div className="flex-1 pb-2">
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-sm text-gray-900">@{c.owner?.username}</span>
                                        <span className="text-[10px] text-gray-400 font-bold uppercase">
                                            {new Date(c.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-700 mt-1 leading-relaxed">
                                        {c.content}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};