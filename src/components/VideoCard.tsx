import React from 'react';
import { Heart, MessageCircle, Play, Edit3, Trash2, Eye, EyeOff, X, ListPlus } from 'lucide-react';
import { useState } from 'react';
import { AddToPlaylistModal } from './AddToPlaylistModal';
import type { Video } from '../types';
import { Link } from 'react-router-dom';

interface VideoCardProps {
    video: Video;
    onClick: (v: Video) => void;
    isOwner?: boolean;
    onEdit?: (v: Video) => void;
    onTogglePublish?: (id: string) => void;
    onToggleLike?: (id: string, e: React.MouseEvent) => void;
    onDelete?: (id: string) => void;
    onRemoveFromHistory?: (id: string, e: React.MouseEvent) => void;
}

const getOptimizedUrl = (url?: string) => {
    if (!url) return "";
    // Cloudinary dynamic format and quality optimization
    if (url.includes("/upload/")) {
        return url.replace("/upload/", "/upload/f_auto,q_auto/");
    }
    return url;
};

export const VideoCard: React.FC<VideoCardProps> = ({ video, onClick, isOwner, onEdit, onDelete, onTogglePublish, onToggleLike, onRemoveFromHistory }) => {
    const [showPlaylistModal, setShowPlaylistModal] = useState(false);

    return (
        <div
            onClick={() => onClick(video)}
            className="bg-white dark:bg-[#1a1725] rounded-3xl border border-gray-100 dark:border-gray-800 overflow-hidden group hover:shadow-2xl transition-all duration-300 cursor-pointer h-full flex flex-col relative"
        >
            <div className="relative aspect-video overflow-hidden shrink-0">
                <img
                    src={getOptimizedUrl(video.thumbnail?.url)}
                    className="w-full h-full object-cover transition duration-500 group-hover:scale-110"
                    alt="Video Thumbnail"
                    onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        if (!target.src.includes("unsplash.com")) {
                            target.src = "https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=1000&auto=format&fit=crop";
                        }
                    }}
                />

                {/* MANAGEMENT OVERLAY */}
                <div className="absolute top-3 right-3 flex flex-col gap-2 z-20">
                    {/* Add to Playlist Button */}
                    <button 
                        onClick={(e) => { e.stopPropagation(); setShowPlaylistModal(true); }} 
                        className="p-3 bg-white/90 dark:bg-black/60 backdrop-blur-md text-gray-600 dark:text-gray-300 rounded-2xl shadow-xl hover:bg-blue-600 hover:text-white transition-all active:scale-90 opacity-0 group-hover:opacity-100"
                        title="Add to Playlist"
                    >
                        <ListPlus size={18} />
                    </button>

                    {isOwner && onEdit && onDelete && (
                        <>
                            {onTogglePublish && (
                                <button onClick={(e) => { e.stopPropagation(); onTogglePublish(video._id); }} className={`p-3 bg-white/90 dark:bg-black/60 backdrop-blur-md rounded-2xl shadow-xl hover:text-white transition-all active:scale-90 opacity-0 group-hover:opacity-100 ${video.isPublished ? "text-green-600 hover:bg-green-600" : "text-gray-600 dark:text-gray-400 hover:bg-gray-600"}`} title={video.isPublished ? "Unpublish" : "Publish"}>
                                    {video.isPublished ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            )}
                            <button onClick={(e) => { e.stopPropagation(); onEdit(video); }} className="p-3 bg-white/90 dark:bg-black/60 backdrop-blur-md text-blue-600 dark:text-blue-400 rounded-2xl shadow-xl hover:bg-blue-600 hover:text-white transition-all active:scale-90 opacity-0 group-hover:opacity-100"><Edit3 size={18} /></button>
                            <button onClick={(e) => { e.stopPropagation(); onDelete(video._id); }} className="p-3 bg-white/90 dark:bg-black/60 backdrop-blur-md text-red-600 dark:text-red-400 rounded-2xl shadow-xl hover:bg-red-600 hover:text-white transition-all active:scale-90 opacity-0 group-hover:opacity-100"><Trash2 size={18} /></button>
                        </>
                    )}
                </div>

                {/* REMOVE FROM HISTORY OVERLAY */}
                {onRemoveFromHistory && (
                    <button
                        onClick={(e) => { e.stopPropagation(); onRemoveFromHistory(video._id, e); }}
                        className="absolute bottom-3 right-3 p-2 bg-black/60 hover:bg-red-600 text-white rounded-full backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all z-20 active:scale-90"
                        title="Remove from history"
                    >
                        <X size={16} />
                    </button>
                )}

                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="bg-white/20 backdrop-blur-md p-3 rounded-full"><Play className="text-white fill-white" size={32} /></div>
                </div>
            </div>

            <div className="p-5 flex-1 flex flex-col">
                <h3 className="font-bold text-gray-900 dark:text-white truncate mb-4 text-lg">{video.title}</h3>
                <div className="flex items-center gap-3 mb-4">
                    <Link to={`/channel/${video.owner?.username}`} onClick={(e) => e.stopPropagation()} className="shrink-0">
                        <img
                            src={getOptimizedUrl(video.owner?.avatar?.url || video.owner?.avatar)}
                            className="w-8 h-8 rounded-full object-cover border border-gray-100 dark:border-gray-800"
                            alt=""
                        />
                    </Link>
                    <Link to={`/channel/${video.owner?.username}`} onClick={(e) => e.stopPropagation()} className="text-sm font-bold text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 truncate transition-colors">
                        {video.owner?.fullName || video.owner?.username}
                    </Link>
                </div>

                <div className="mt-auto flex justify-between items-center text-gray-500 dark:text-gray-400">
                    <div className="flex gap-4">
                        <button
                            onClick={(e) => onToggleLike && onToggleLike(video._id, e)}
                            className={`flex items-center gap-1.5 ${onToggleLike ? 'hover:scale-110 transition-transform cursor-pointer' : ''}`}
                        >
                            <Heart size={18} className={video.isLiked ? "text-red-500 fill-current" : "text-gray-400 dark:text-gray-600"} />
                            <span className="text-xs font-black">{video.likesCount ?? 0}</span>
                        </button>
                        <div className="flex items-center gap-1.5">
                            <MessageCircle size={18} className="text-gray-400 dark:text-gray-600" />
                            <span className="text-xs font-black">{video.commentCount ?? 0}</span>
                        </div>
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-300 dark:text-gray-600">{video.views?.toLocaleString()} Views</span>
                </div>
            </div>

            {showPlaylistModal && (
                <AddToPlaylistModal 
                    videoId={video._id} 
                    onClose={() => setShowPlaylistModal(false)} 
                />
            )}
        </div>
    );
};