// src/components/ChannelProfile.tsx
import React, { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../api/axios';
import type { Video, Tweet, Owner, ApiResponse } from '../types';
import { useAuth } from '../context/AuthContext';
import { Edit3, Trash2, X, MessageCircle, UserPlus, UserCheck, ListMusic, Plus, Play, ChevronRight } from 'lucide-react';
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
    const [activeTab, setActiveTab] = useState<'videos' | 'tweets' | 'playlists'>('videos');
    const [playlists, setPlaylists] = useState<any[]>([]);
    const [selectedPlaylist, setSelectedPlaylist] = useState<any | null>(null);
    const [isEditingPlaylist, setIsEditingPlaylist] = useState(false);
    const [editPlaylistData, setEditPlaylistData] = useState({ name: "", description: "" });
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

            const [videoRes, tweetRes, playlistRes] = await Promise.all([
                api.get(`/videos?userId=${profileData._id}`),
                api.get(`/tweets/user/${profileData._id}`),
                api.get(`/playlists/user/${profileData._id}`)
            ]);

            setVideos(videoRes.data.data.docs);
            setTweets(tweetRes.data.data.docs);
            setPlaylists(playlistRes.data.data);
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
            const newProfile = profileRes.data.data;
            setProfile(newProfile);

            // Dispatch event with truth from backend
            window.dispatchEvent(new CustomEvent('subscriptionChange', {
                detail: { channelId: id, isSubscribed: newProfile.isSubscribed, subscribersCount: newProfile.subscribersCount }
            }));
        } catch (err) { console.error(err); }
    };

    // Listen to subscription changes from GlobalVideoModal
    useEffect(() => {
        const handleSubChange = (e: any) => {
            if (profile && e.detail.channelId === profile._id) {
                setProfile(prev => {
                    if (!prev) return prev;
                    if (prev.isSubscribed === e.detail.isSubscribed) return prev;
                    return {
                        ...prev,
                        isSubscribed: e.detail.isSubscribed,
                        subscribersCount: e.detail.subscribersCount ?? prev.subscribersCount
                    };
                });
            }
        };
        window.addEventListener('subscriptionChange', handleSubChange);
        return () => window.removeEventListener('subscriptionChange', handleSubChange);
    }, [profile?._id]);
    
    // Listen to video like/comment changes from GlobalVideoModal or other cards
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

    const handleTogglePublish = async (videoId: string) => {
        try {
            await api.patch(`/videos/toggle/publish/${videoId}`);
            setVideos(prev => prev.map(v => v._id === videoId ? { ...v, isPublished: !v.isPublished } : v));
        } catch (err) { alert("Toggle failed"); }
    };

    const handleDeletePlaylist = async (playlistId: string) => {
        if (!window.confirm("Delete this playlist? This won't delete the videos themselves.")) return;
        try {
            await api.delete(`/playlists/${playlistId}`);
            setPlaylists(prev => prev.filter(p => p._id !== playlistId));
            setSelectedPlaylist(null);
        } catch (err) {
            console.error("Delete playlist failed", err);
        }
    };

    const handleUpdatePlaylist = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedPlaylist) return;
        try {
            const { data } = await api.patch(`/playlists/${selectedPlaylist._id}`, editPlaylistData);
            setPlaylists(prev => prev.map(p => p._id === selectedPlaylist._id ? { ...p, ...editPlaylistData } : p));
            setSelectedPlaylist(prev => ({ ...prev, ...editPlaylistData }));
            setIsEditingPlaylist(false);
        } catch (err) {
            console.error("Update playlist failed", err);
        }
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

    const handleToggleLike = async (videoId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        try {
            const { data } = await api.post(`/likes/toggle/v/${videoId}`);
            const newIsLiked = data.data.isLiked;

            // 1. Calculate the new count based on current state
            const videoToUpdate = videos.find(v => v._id === videoId);
            if (!videoToUpdate) return;

            const newCount = newIsLiked 
                ? (videoToUpdate.likesCount || 0) + 1 
                : Math.max(0, (videoToUpdate.likesCount || 0) - 1);

            // 2. Dispatch the event with the CORRECT count
            window.dispatchEvent(new CustomEvent('videoLikeChange', {
                detail: { videoId, isLiked: newIsLiked, likesCount: newCount }
            }));

            // 3. Update local state immediately
            setVideos(prev => prev.map(v => 
                v._id === videoId 
                ? { ...v, isLiked: newIsLiked, likesCount: newCount } 
                : v
            ));
        } catch (err) {
            console.error("Like failed", err);
        }
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
                            className={`flex items-center justify-center gap-2 px-10 py-3.5 rounded-full font-bold transition-all active:scale-95 shadow-sm ${profile?.isSubscribed
                                ? "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200"
                                : "bg-blue-600 text-white hover:bg-blue-700 hover:shadow-blue-500/20"}`}
                        >
                            {profile?.isSubscribed ? (
                                <>
                                    <UserCheck size={20} />
                                    <span>Subscribed</span>
                                </>
                            ) : (
                                <>
                                    <UserPlus size={20} />
                                    <span>Subscribe</span>
                                </>
                            )}
                        </button>
                    )}
                </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-100 mb-6 mt-8">
                {['videos', 'tweets', 'playlists'].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => {
                            setActiveTab(tab as any);
                            setSelectedPlaylist(null); // Clear selected playlist when switching tabs
                        }}
                        className={`px-6 py-3 font-bold transition capitalize ${activeTab === tab ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-400'}`}
                    >
                        {tab} ({tab === 'videos' ? videos.length : tab === 'tweets' ? tweets.length : playlists.length})
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            {activeTab === 'videos' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {videos.map(v => (
                        <VideoCard
                            key={v._id}
                            video={v}
                            isOwner={isOwner}
                            onEdit={() => { setEditingVideo(v); setEditVideoData({ title: v.title, description: v.description }); }}
                            onDelete={handleDeleteVideo}
                            onTogglePublish={handleTogglePublish}
                            onToggleLike={handleToggleLike}
                            onClick={() => playVideo(v)}
                        />
                    ))}
                </div>
            )}

            {activeTab === 'tweets' && (
                <div className="space-y-4 max-w-2xl">
                    {tweets.map(t => (
                        <div key={t._id} className="group bg-white dark:bg-white/5 p-6 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm transition-all hover:border-blue-100">
                            {editingTweetId === t._id ? (
                                <div className="space-y-3">
                                    <textarea className="w-full bg-white dark:bg-[#13111C] border-2 border-blue-100 p-4 rounded-xl outline-none h-32 resize-none dark:text-white" value={editTweetContent} onChange={(e) => setEditTweetContent(e.target.value)} />
                                    <div className="flex gap-2">
                                        <button onClick={() => handleUpdateTweet(t._id)} className="bg-blue-600 text-white px-5 py-2 rounded-xl text-sm font-bold shadow-lg shadow-blue-100">Save</button>
                                        <button onClick={() => setEditingTweetId(null)} className="bg-gray-100 text-gray-600 px-5 py-2 rounded-xl text-sm font-bold">Cancel</button>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex justify-between items-start gap-4">
                                    <div className="flex-1">
                                        <p className="text-gray-800 dark:text-gray-200 text-lg leading-relaxed">{t.content}</p>
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

            {activeTab === 'playlists' && (
                <div>
                    {!selectedPlaylist ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                            {playlists.map((playlist) => (
                                <div 
                                    key={playlist._id} 
                                    onClick={() => setSelectedPlaylist(playlist)}
                                    className="group cursor-pointer"
                                >
                                    <div className="relative aspect-video rounded-3xl overflow-hidden bg-gray-100 dark:bg-white/5 mb-4 shadow-lg transition-transform group-hover:-translate-y-2">
                                        {playlist.thumbnail ? (
                                            <img src={playlist.thumbnail} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" alt="" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <ListMusic size={48} className="text-gray-300" />
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                        <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                                            <div className="flex items-center gap-2 text-white font-bold">
                                                <ListMusic size={18} />
                                                <span>{playlist.totalVideos} Videos</span>
                                            </div>
                                            <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white scale-0 group-hover:scale-100 transition-transform">
                                                <Play fill="currentColor" size={20} />
                                            </div>
                                        </div>
                                    </div>
                                    <h4 className="text-xl font-black text-gray-900 dark:text-white mb-1 group-hover:text-blue-600 transition-colors">{playlist.name}</h4>
                                    <p className="text-sm text-gray-500 line-clamp-1">{playlist.description}</p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="space-y-8">
                            <div className="bg-gray-50 dark:bg-white/5 p-8 rounded-[40px] flex flex-col md:flex-row gap-8 items-start">
                                <div className="w-full md:w-64 aspect-video rounded-3xl overflow-hidden bg-gray-200 shadow-2xl">
                                    {selectedPlaylist.thumbnail ? (
                                        <img src={selectedPlaylist.thumbnail} className="w-full h-full object-cover" alt="" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-slate-800"><ListMusic size={48} className="text-white/20" /></div>
                                    )}
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-start">
                                        <button 
                                            onClick={() => {
                                                setSelectedPlaylist(null);
                                                setIsEditingPlaylist(false);
                                            }}
                                            className="text-sm font-bold text-blue-600 mb-4 flex items-center gap-1 hover:gap-2 transition-all"
                                        >
                                            <ChevronRight size={16} className="rotate-180" /> Back to Playlists
                                        </button>
                                        {isOwner && (
                                            <div className="flex gap-2">
                                                <button 
                                                    onClick={() => {
                                                        setIsEditingPlaylist(!isEditingPlaylist);
                                                        setEditPlaylistData({ name: selectedPlaylist.name, description: selectedPlaylist.description });
                                                    }}
                                                    className={`p-3 rounded-2xl shadow-sm transition-all ${isEditingPlaylist ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white'}`}
                                                    title="Edit Playlist"
                                                >
                                                    <Edit3 size={20} />
                                                </button>
                                                <button 
                                                    onClick={() => handleDeletePlaylist(selectedPlaylist._id)}
                                                    className="p-3 bg-red-50 text-red-600 rounded-2xl hover:bg-red-600 hover:text-white transition-all shadow-sm"
                                                    title="Delete Playlist"
                                                >
                                                    <Trash2 size={20} />
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    {isEditingPlaylist ? (
                                        <form onSubmit={handleUpdatePlaylist} className="mt-4 space-y-4 max-w-xl">
                                            <input
                                                className="w-full bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl px-6 py-4 outline-none focus:ring-4 focus:ring-blue-500/10 font-bold text-2xl dark:text-white"
                                                value={editPlaylistData.name}
                                                onChange={e => setEditPlaylistData({ ...editPlaylistData, name: e.target.value })}
                                                placeholder="Playlist Name"
                                                required
                                            />
                                            <textarea
                                                className="w-full bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl px-6 py-4 outline-none focus:ring-4 focus:ring-blue-500/10 dark:text-gray-300 h-32 resize-none"
                                                value={editPlaylistData.description}
                                                onChange={e => setEditPlaylistData({ ...editPlaylistData, description: e.target.value })}
                                                placeholder="Description"
                                                required
                                            />
                                            <div className="flex gap-3">
                                                <button type="submit" className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-500/20">Save Changes</button>
                                                <button type="button" onClick={() => setIsEditingPlaylist(false)} className="px-8 py-3 bg-gray-100 text-gray-600 rounded-xl font-bold">Cancel</button>
                                            </div>
                                        </form>
                                    ) : (
                                        <>
                                            <h2 className="text-4xl font-black text-gray-900 dark:text-white mb-2">{selectedPlaylist.name}</h2>
                                            <p className="text-gray-500 dark:text-gray-400 max-w-2xl">{selectedPlaylist.description}</p>
                                        </>
                                    )}
                                    <div className="mt-6 flex items-center gap-4">
                                        <span className="text-xs font-black uppercase tracking-widest bg-blue-100 text-blue-600 px-3 py-1 rounded-full">
                                            {selectedPlaylist.totalVideos} Videos
                                        </span>
                                        <span className="text-xs text-gray-400">Created {new Date(selectedPlaylist.createdAt).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {selectedPlaylist.videos?.map((video: any) => (
                                    <VideoCard
                                        key={video._id}
                                        video={video}
                                        onClick={playVideo}
                                        onToggleLike={handleToggleLike}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
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