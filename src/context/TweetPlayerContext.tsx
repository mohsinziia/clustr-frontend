// src/context/TweetPlayerContext.tsx
import React, { createContext, useContext, useState } from 'react';
import { GlobalTweetModal } from '../components/GlobalTweetModal';
import type { Tweet } from '../types';

interface TweetPlayerContextType {
    openTweet: (tweet: Tweet, onUpdate?: (updatedTweet: Tweet) => void) => void;
    closeTweet: () => void;
}

const TweetPlayerContext = createContext<TweetPlayerContextType | undefined>(undefined);

export const TweetPlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [activeTweet, setActiveTweet] = useState<Tweet | null>(null);
    // Track the callback for the current session
    const [updateCallback, setUpdateCallback] = useState<((t: Tweet) => void) | undefined>();

    const openTweet = (tweet: Tweet, onUpdate?: (t: Tweet) => void) => {
        setActiveTweet(tweet);
        setUpdateCallback(() => onUpdate); // Store the callback from the feed
    };

    const handleClose = () => {
        // When closing, if we have an updated tweet state, we'll pass it back
        // but typically the modal handles its own state. 
        // We'll pass the close action to the modal.
        setActiveTweet(null);
    };

    return (
        <TweetPlayerContext.Provider value={{ openTweet, closeTweet: handleClose }}>
            {children}
            {activeTweet && (
                <GlobalTweetModal
                    tweet={activeTweet}
                    onClose={handleClose}
                    onSync={updateCallback} // Pass the sync function to the modal
                />
            )}
        </TweetPlayerContext.Provider>
    );
};

export const useTweetPlayer = () => useContext(TweetPlayerContext)!;