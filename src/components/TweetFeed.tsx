import React, { useEffect, useState, useCallback } from 'react';
import api from '../api/axios';
import type { Tweet, ApiResponse, PaginatedData } from '../types';
import { MessageSquare, Heart, User as UserIcon, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTweetPlayer } from '../context/TweetPlayerContext';
import { TweetCardSkeleton } from './Skeletons';

export const TweetFeed: React.FC = () => {
    const [tweets, setTweets] = useState<Tweet[]>([]);
    const [loading, setLoading] = useState(false);
    const { openTweet } = useTweetPlayer();

    // src/components/TweetFeed.tsx

    const fetchAllTweets = useCallback(async () => {
        try {
            setLoading(true);
            const { data } = await api.get("/tweets");

            // Since you want data.data, we set it directly.
            // We use || [] as a fallback to prevent the .map() error.
            setTweets(data.data || []);
        } catch (error) {
            console.error("Error fetching tweets:", error);
            setTweets([]);
        } finally {
            setLoading(false);
        }
    }, []);

    const handleSyncTweet = (updatedTweet: Tweet) => {
        setTweets(prev => prev.map(t =>
            t._id === updatedTweet._id ? updatedTweet : t
        ));
    };

    const handleToggleLike = async (e: React.MouseEvent, tweetId: string) => {
        e.stopPropagation();
        try {
            const { data } = await api.post(`/likes/toggle/t/${tweetId}`);
            if (data?.success) {
                setTweets(prev => prev.map(t => {
                    if (t._id === tweetId) {
                        const newIsLiked = data.data.isLiked;
                        return {
                            ...t,
                            isLiked: newIsLiked,
                            likesCount: newIsLiked
                                ? (t.likesCount || 0) + 1
                                : Math.max(0, (t.likesCount || 0) - 1)
                        };
                    }
                    return t;
                }));
            }
        } catch (err) {
            console.error("Like failed", err);
        }
    };

    useEffect(() => {
        fetchAllTweets();
    }, [fetchAllTweets]);

    if (loading) return (
        <div className="max-w-2xl mx-auto p-4">
            <h2 className="text-2xl font-black mb-8 text-gray-900 tracking-tight">Explore</h2>
            <div className="flex flex-col space-y-3">
                {/* Render 5 skeletons while loading */}
                {[...Array(5)].map((_, i) => (
                    <TweetCardSkeleton key={i} />
                ))}
            </div>
        </div>
    );

    // src/components/TweetFeed.tsx

    return (
        <div className="max-w-2xl mx-auto p-4">
            <h2 className="text-2xl font-black mb-8 text-gray-900 tracking-tight">Explore</h2>

            {/* Changed space-y-px to space-y-3 for a balanced gap */}
            <div className="flex flex-col space-y-3">
                {Array.isArray(tweets) && tweets.map(tweet => (
                    <div
                        key={tweet._id}
                        onClick={() => openTweet(tweet, handleSyncTweet)}
                        className="bg-white p-5 cursor-pointer hover:bg-gray-50 transition-all group border border-gray-100 rounded-2xl shadow-sm"
                    >
                        <div className="flex gap-3">
                            <Link
                                to={`/channel/${tweet.owner?.username}`}
                                onClick={(e) => e.stopPropagation()}
                                className="shrink-0"
                            >
                                <img
                                    src={tweet.owner?.avatar?.url || tweet.owner?.avatar}
                                    className="w-12 h-12 rounded-full object-cover border border-gray-100"
                                    alt=""
                                />
                            </Link>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5 mb-1">
                                    <span className="font-bold text-gray-900 truncate">
                                        {tweet.owner?.fullName}
                                    </span>
                                    <span className="text-gray-500 text-sm truncate">
                                        @{tweet.owner?.username}
                                    </span>
                                </div>
                                <p className="text-[15px] text-gray-800 leading-normal mb-3 whitespace-pre-wrap">
                                    {tweet.content}
                                </p>
                                <div className="flex items-center gap-8 text-gray-400">
                                    <div className="flex items-center gap-2">
                                        <MessageCircle size={18} className="text-gray-400" />
                                        <span className="text-sm font-bold text-gray-400">
                                            {tweet.commentCount || 0}
                                        </span>
                                    </div>
                                    <button
                                        onClick={(e) => handleToggleLike(e, tweet._id)}
                                        className="flex items-center gap-1.5 hover:text-red-500 transition-colors group/like"
                                    >
                                        <Heart
                                            size={18}
                                            className={tweet.isLiked ? "fill-red-500 text-red-500" : "text-gray-400 group-hover/like:text-red-500"}
                                        />
                                        <span className="text-xs font-bold">{tweet.likesCount || 0}</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};