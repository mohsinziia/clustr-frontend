import React, { createContext, useContext, useState } from 'react';
import { GlobalTweetModal } from '../components/GlobalTweetModal';
import type { Tweet } from '../types';

interface TweetPlayerContextType {
    openTweet: (tweet: Tweet) => void;
    closeTweet: () => void;
}

const TweetPlayerContext = createContext<TweetPlayerContextType | undefined>(undefined);

export const TweetPlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [activeTweet, setActiveTweet] = useState<Tweet | null>(null);

    return (
        <TweetPlayerContext.Provider value={{ openTweet: setActiveTweet, closeTweet: () => setActiveTweet(null) }}>
            {children}
            {activeTweet && (
                <GlobalTweetModal
                    tweet={activeTweet}
                    onClose={() => setActiveTweet(null)}
                />
            )}
        </TweetPlayerContext.Provider>
    );
};

export const useTweetPlayer = () => {
    const context = useContext(TweetPlayerContext);
    if (!context) throw new Error("useTweetPlayer must be used within Provider");
    return context;
};