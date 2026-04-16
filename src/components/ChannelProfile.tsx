// src/components/ChannelProfile.tsx
import React, { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../api/axios';
import type { Video, Tweet, Owner, ApiResponse } from '../types';
import { useAuth } from '../context/AuthContext';
import { Edit3, Trash2, X, MessageCircle } from 'lucide-react';
import { VideoCard } from './VideoCard';
import { useVideoPlayer } from './VideoPlayerContext';

// --- Skeleton UI Components ---
const VideoSkeleton = () => (
    <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden animate-pulse">
        <div className="aspect-video bg-gray-200" />
        <div className="p-5">
            <div className="h-6 bg-gray-200 rounded-lg w-3/4 mb-4" />
            <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-gray-200" />
                <div className="h-4 bg-gray-200 rounded-md w-1/2" />
            </div>
            <div className="flex justify-between">
                <div className="h-4 bg-gray-100 rounded-md w-1/4" />
                <div className="h-4 bg-gray-100 rounded-md w-1/4" />
            </div>
        </div>
    </div>
);

export const ChannelProfile: React.FC = () => {
    const { username } = useParams<{ username: string }>();
    const [profile, setProfile] = useState<Owner | null>(null);
    const [videos, setVideos] = useState<Video[]>([]);
    const [tweets, setTweets] = useState<Tweet[]>([]);
    const [activeTab, setActiveTab] = useState<'videos' | 'tweets'>('videos');
    const [loading, setLoading] = useState(true);

    const { playVideo } = useVideoPlayer();
    const { user: authUser } = useAuth();

    const isOwner = authUser?._id === profile?._id;

    // Management States
    const [editingVideo, setEditingVideo] = useState<Video | null>(null);
    const [editVideoData, setEditVideoData] = useState({ title: '', description: '' });
    const [editingTweetId, setEditingTweetId] = useState<string | null>(null);
    const [editTweetContent, setEditTweetContent] = useState("");

    const fetchChannelData = useCallback(async () => {
        try {
            setLoading(true);
            const profileRes = await api.get<ApiResponse<any>>(`/users/c/${username}`);
            const profileData = profileRes.data.data;
            setProfile(profileData);

            const [videoRes, tweetRes] = await Promise.all([
                api.get(`/videos?userId=${profileData._id}`),
                api.get(`/tweets/user/${profileData._id}`)
            ]);

            setVideos(videoRes.data.data.docs);
            setTweets(tweetRes.data.data.docs);
        } catch (err) {
            console.error("Error loading channel:", err);
        } finally {
            setLoading(false);
        }
    }, [username]);

    useEffect(() => {
        if (username) fetchChannelData();
    }, [username, fetchChannelData]);

    const handleSubscribeInProfile = async (id: string) => {
        try {
            await api.post(`/subscriptions/c/${id}`);
            const profileRes = await api.get<ApiResponse<any>>(`/users/c/${username}`);
            setProfile(profileRes.data.data);
        } catch (err) { console.error(err); }
    };

    const handleUpdateVideo = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingVideo) return;
        try {
            await api.patch(`/videos/${editingVideo._id}`, editVideoData);
            setVideos(prev => prev.map(v => v._id === editingVideo._id ? { ...v, ...editVideoData } : v));
            setEditingVideo(null);
        } catch (err) { alert("Update failed"); }
    };

    const handleDeleteVideo = async (videoId: string) => {
        if (!window.confirm("Delete video permanently?")) return;
        try {
            await api.delete(`/videos/${videoId}`);
            setVideos(prev => prev.filter(v => v._id !== videoId));
        } catch (err) { alert("Delete failed"); }
    };

    const handleUpdateTweet = async (tweetId: string) => {
        if (!editTweetContent.trim()) return;
        try {
            await api.patch(`/tweets/${tweetId}`, { content: editTweetContent });
            setTweets(prev => prev.map(t => t._id === tweetId ? { ...t, content: editTweetContent } : t));
            setEditingTweetId(null);
        } catch (err) { alert("Update failed"); }
    };

    const handleDeleteTweet = async (tweetId: string) => {
        if (!window.confirm("Delete tweet?")) return;
        try {
            await api.delete(`/tweets/${tweetId}`);
            setTweets(prev => prev.filter(t => t._id !== tweetId));
        } catch (err) { alert("Delete failed"); }
    };

    // --- Loading State (Dummy UI) ---
    if (loading) return (
        <div className="max-w-6xl mx-auto p-6 animate-pulse">
            <div className="w-full h-48 lg:h-80 bg-gray-200 rounded-b-[40px]" />
            <div className="px-8 -mt-24 flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b">
                <div className="flex flex-col md:flex-row md:items-end gap-6">
                    <div className="w-40 h-40 lg:w-48 lg:h-48 rounded-full bg-gray-300 border-[6px] border-white" />
                    <div className="md:mb-4 space-y-3">
                        <div className="h-10 bg-gray-200 rounded-xl w-64" />
                        <div className="h-4 bg-gray-200 rounded-lg w-40" />
                    </div>
                </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
                {[...Array(3)].map((_, i) => <VideoSkeleton key={i} />)}
            </div>
        </div>
    );

    if (!profile) return <div className="p-20 text-center text-red-500">Channel not found.</div>;

    return (
        <div className="max-w-6xl mx-auto p-6">
            {/* Header / Cover Image */}
            <div className="relative w-full h-48 lg:h-80 bg-gray-200 rounded-b-[40px] overflow-hidden">
                {profile?.coverImage?.url ? (
                    <img src={profile.coverImage.url} className="w-full h-full object-cover" alt="" />
                ) : (
                    <div className="w-full h-full bg-gradient-to-tr from-slate-800 to-slate-900" />
                )}
            </div>

            {/* Profile Info & Subscriber Count Pluralization */}
            <div className="px-8 -mt-24 relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-gray-100">
                <div className="flex flex-col md:flex-row md:items-end gap-6">
                    <img
                        src={profile?.avatar?.url || profile?.avatar}
                        className="w-40 h-40 lg:w-48 lg:h-48 rounded-full border-[6px] border-white shadow-2xl object-cover bg-white"
                        alt=""
                    />
                    <div className="md:mb-4">
                        <h1 className="text-4xl font-black text-gray-900 tracking-tight">{profile?.fullName}</h1>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="text-blue-600 font-bold">@{profile?.username}</span>
                            <span className="text-gray-300">•</span>
                            <span className="text-gray-500 font-medium">
                                {profile?.subscribersCount || 0} {profile?.subscribersCount === 1 ? 'Subscriber' : 'Subscribers'}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="md:mb-4">
                    {isOwner ? (
                        <Link to="/settings" className="bg-white border-2 border-gray-100 px-8 py-3 rounded-2xl font-bold text-gray-700 hover:bg-gray-50 transition-all">
                            Edit Profile
                        </Link>
                    ) : (
                        <button
                            onClick={() => handleSubscribeInProfile(profile?._id)}
                            className={`px-10 py-3 rounded-2xl font-bold transition-all shadow-lg ${profile?.isSubscribed ? "bg-gray-100 text-gray-600" : "bg-blue-600 text-white"}`}
                        >
                            {profile?.isSubscribed ? "Subscribed" : "Subscribe"}
                        </button>
                    )}
                </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-100 mb-6 mt-8">
                {['videos', 'tweets'].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab as any)}
                        className={`px-6 py-3 font-bold transition capitalize ${activeTab === tab ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-400'}`}
                    >
                        {tab} ({tab === 'videos' ? videos.length : tweets.length})
                    </button>
                ))}
            </div>

            {/* Video List with Integrated Management */}
            {activeTab === 'videos' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {videos.map(v => (
                        <VideoCard
                            key={v._id}
                            video={v}
                            isOwner={isOwner}
                            onEdit={() => { setEditingVideo(v); setEditVideoData({ title: v.title, description: v.description }); }}
                            onDelete={handleDeleteVideo}
                            onClick={() => playVideo(v)}
                        />
                    ))}
                </div>
            ) : (
                <div className="space-y-4 max-w-2xl">
                    {tweets.map(t => (
                        <div key={t._id} className="group bg-white p-6 rounded-2xl border border-gray-100 shadow-sm transition-all hover:border-blue-100">
                            {editingTweetId === t._id ? (
                                <div className="space-y-3">
                                    <textarea className="w-full border-2 border-blue-100 p-4 rounded-xl outline-none h-32 resize-none" value={editTweetContent} onChange={(e) => setEditTweetContent(e.target.value)} />
                                    <div className="flex gap-2">
                                        <button onClick={() => handleUpdateTweet(t._id)} className="bg-blue-600 text-white px-5 py-2 rounded-xl text-sm font-bold shadow-lg shadow-blue-100">Save</button>
                                        <button onClick={() => setEditingTweetId(null)} className="bg-gray-100 text-gray-600 px-5 py-2 rounded-xl text-sm font-bold">Cancel</button>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex justify-between items-start gap-4">
                                    <div className="flex-1">
                                        <p className="text-gray-800 text-lg leading-relaxed">{t.content}</p>
                                        <div className="flex items-center gap-2 mt-4 text-gray-400 text-xs font-bold uppercase tracking-widest">
                                            <MessageCircle size={14} /> {new Date(t.createdAt).toLocaleDateString()}
                                        </div>
                                    </div>
                                    {isOwner && (
                                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => { setEditingTweetId(t._id); setEditTweetContent(t.content); }} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all"><Edit3 size={18} /></button>
                                            <button onClick={() => handleDeleteTweet(t._id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"><Trash2 size={18} /></button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Video Edit Modal */}
            {editingVideo && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-gray-900">Edit Video Details</h2>
                            <button onClick={() => setEditingVideo(null)} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
                        </div>
                        <form onSubmit={handleUpdateVideo} className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Title</label>
                                <input className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500" value={editVideoData.title} onChange={(e) => setEditVideoData({ ...editVideoData, title: e.target.value })} required />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Description</label>
                                <textarea className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none h-32 resize-none focus:ring-2 focus:ring-blue-500" value={editVideoData.description} onChange={(e) => setEditVideoData({ ...editVideoData, description: e.target.value })} />
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button type="button" onClick={() => setEditingVideo(null)} className="flex-1 px-4 py-3 rounded-xl text-gray-500 font-bold hover:bg-gray-100">Cancel</button>
                                <button type="submit" className="flex-1 px-4 py-3 rounded-xl bg-blue-600 text-white font-bold shadow-lg shadow-blue-100">Update Video</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};