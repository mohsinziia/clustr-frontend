import React, { useEffect, useState } from 'react';
import { X, Plus, ListMusic, Check } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';

interface AddToPlaylistModalProps {
    videoId: string;
    onClose: () => void;
}

export const AddToPlaylistModal: React.FC<AddToPlaylistModalProps> = ({ videoId, onClose }) => {
    const { user } = useAuth();
    const [playlists, setPlaylists] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreate, setShowCreate] = useState(false);
    const [newName, setNewName] = useState("");
    const [newDesc, setNewDesc] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchPlaylists = async () => {
        if (!user?._id) return;
        try {
            const { data } = await api.get(`/playlists/user/${user._id}`);
            setPlaylists(data.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPlaylists();
    }, [user?._id]);

    const handleCreatePlaylist = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isSubmitting) return;
        try {
            setIsSubmitting(true);
            const { data } = await api.post('/playlists', { name: newName, description: newDesc });
            // Immediately add the video to the newly created playlist
            await api.patch(`/playlists/add/${videoId}/${data.data._id}`);
            toast.success("Created and added to playlist!");
            onClose();
        } catch (err) {
            toast.error("Failed to create playlist");
        } finally {
            setIsSubmitting(false);
        }
    };

    const toggleVideoInPlaylist = async (playlistId: string, isIn: boolean) => {
        try {
            if (isIn) {
                await api.patch(`/playlists/remove/${videoId}/${playlistId}`);
                toast.success("Removed from playlist");
            } else {
                await api.patch(`/playlists/add/${videoId}/${playlistId}`);
                toast.success("Added to playlist");
            }
            fetchPlaylists();
        } catch (err) {
            toast.error("Failed to update playlist");
        }
    };

    return (
        <div 
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm cursor-default"
            onClick={(e) => e.stopPropagation()}
        >
            <div className="bg-white dark:bg-[#1a1725] w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-gray-100 dark:border-white/5">
                <div className="p-6 border-b border-gray-100 dark:border-white/5 flex items-center justify-between">
                    <h3 className="text-xl font-black dark:text-white flex items-center gap-2">
                        <ListMusic className="text-blue-500" /> Add to Playlist
                    </h3>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-full dark:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 max-h-96 overflow-y-auto">
                    {loading ? (
                        <div className="flex justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {playlists.map((playlist) => {
                                const isVideoIn = playlist.videos.some((v: any) => (v._id || v) === videoId);
                                return (
                                    <button
                                        key={playlist._id}
                                        onClick={() => toggleVideoInPlaylist(playlist._id, isVideoIn)}
                                        className="w-full flex items-center justify-between p-4 rounded-2xl hover:bg-gray-50 dark:hover:bg-white/5 transition-all group"
                                    >
                                        <div className="flex flex-col items-start">
                                            <span className="font-bold dark:text-white">{playlist.name}</span>
                                            <span className="text-xs text-gray-500">{playlist.videos.length} videos</span>
                                        </div>
                                        <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                                            isVideoIn 
                                            ? 'bg-blue-500 border-blue-500 text-white' 
                                            : 'border-gray-200 dark:border-gray-800 group-hover:border-blue-500'
                                        }`}>
                                            {isVideoIn && <Check size={16} strokeWidth={3} />}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    )}

                    {!showCreate ? (
                        <button 
                            onClick={() => setShowCreate(true)}
                            className="w-full mt-4 flex items-center justify-center gap-2 py-4 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-2xl text-gray-500 font-bold hover:border-blue-500 hover:text-blue-500 transition-all"
                        >
                            <Plus size={18} /> Create New Playlist
                        </button>
                    ) : (
                        <form onSubmit={handleCreatePlaylist} className="mt-6 space-y-4 p-4 bg-gray-50 dark:bg-white/5 rounded-2xl">
                            <input
                                autoFocus
                                placeholder="Playlist Name"
                                className="w-full bg-white dark:bg-[#13111C] border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500/20 dark:text-white"
                                value={newName}
                                onChange={e => setNewName(e.target.value)}
                                required
                            />
                            <textarea
                                placeholder="Description"
                                className="w-full bg-white dark:bg-[#13111C] border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500/20 dark:text-white h-24 resize-none"
                                value={newDesc}
                                onChange={e => setNewDesc(e.target.value)}
                                required
                            />
                            <div className="flex gap-2">
                                <button 
                                    type="button" 
                                    onClick={() => setShowCreate(false)}
                                    className="flex-1 py-3 font-bold text-gray-500"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isSubmitting ? "Creating..." : "Create"}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};
