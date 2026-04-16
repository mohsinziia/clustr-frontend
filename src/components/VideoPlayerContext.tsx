// src/context/VideoPlayerContext.tsx
import React, { createContext, useContext, useState } from 'react';
import type{ Video } from '../types';
import { GlobalVideoModal } from './GlobalVideoModal';

interface VideoPlayerContextType {
    activeVideo: Video | null;
    playVideo: (video: Video) => void;
    closeVideo: () => void;
}

const VideoPlayerContext = createContext<VideoPlayerContextType | undefined>(undefined);

export const VideoPlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [activeVideo, setActiveVideo] = useState<Video | null>(null);

    const playVideo = (video: Video) => setActiveVideo(video);
    const closeVideo = () => setActiveVideo(null);

    return (
        <VideoPlayerContext.Provider value={{ activeVideo, playVideo, closeVideo }}>
            {children}
            {/* The actual Modal component is placed here so it's always ready */}
            {activeVideo && <GlobalVideoModal video={activeVideo} onClose={closeVideo} />}
        </VideoPlayerContext.Provider>
    );
};

export const useVideoPlayer = () => {
    const context = useContext(VideoPlayerContext);
    if (!context) throw new Error("useVideoPlayer must be used within Provider");
    return context;
};