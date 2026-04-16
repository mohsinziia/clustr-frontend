import api from "../api/axios";
import type { Video } from "../types";

// src/hooks/useVideoActions.ts
export const useVideoActions = (setVideos: React.Dispatch<React.SetStateAction<Video[]>>) => {
    
    const handleDeleteVideo = async (videoId: string) => {
        if (!window.confirm("Delete permanently?")) return;
        try {
            await api.delete(`/videos/${videoId}`);
            setVideos(prev => prev.filter(v => v._id !== videoId));
        } catch (err) { alert("Delete failed"); }
    };

    const handleToggleLike = async (videoId: string) => {
        try {
            // Optimistic Update logic here...
            await api.post(`/likes/toggle/v/${videoId}`);
        } catch (err) { console.error(err); }
    };

    return { handleDeleteVideo, handleToggleLike };
};
