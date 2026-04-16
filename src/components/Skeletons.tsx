import React from 'react';

/**
 * Skeleton for the Video Card (Grid layout)
 * Matches VideoCard.tsx dimensions and rounding.
 */
export const VideoSkeleton = () => (
    <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden animate-pulse h-full flex flex-col">
        {/* Thumbnail area */}
        <div className="aspect-video bg-gray-200" />

        <div className="p-5 flex-1 flex flex-col">
            {/* Title line */}
            <div className="h-6 bg-gray-200 rounded-lg w-3/4 mb-4" />

            {/* Channel info area */}
            <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-gray-200 shrink-0" />
                <div className="h-4 bg-gray-100 rounded-md w-1/2" />
            </div>

            {/* Stats row */}
            <div className="mt-auto flex justify-between">
                <div className="flex gap-4">
                    <div className="h-4 bg-gray-100 rounded-md w-10" />
                    <div className="h-4 bg-gray-100 rounded-md w-10" />
                </div>
                <div className="h-3 bg-gray-100 rounded-md w-16" />
            </div>
        </div>
    </div>
);

/**
 * Skeleton for the Tweet/Post Card (Feed layout)
 * Matches the new X/Threads style card design.
 */
export const TweetCardSkeleton = () => (
    <div className="bg-white p-5 border border-gray-100 rounded-2xl shadow-sm animate-pulse w-full">
        <div className="flex gap-3">
            {/* Avatar Circle */}
            <div className="w-12 h-12 rounded-full bg-gray-200 shrink-0" />

            <div className="flex-1 min-w-0">
                {/* Name and Handle lines */}
                <div className="flex gap-2 mb-3">
                    <div className="h-4 bg-gray-200 rounded-md w-24" />
                    <div className="h-4 bg-gray-100 rounded-md w-20" />
                </div>

                {/* Content lines (simulating text rows) */}
                <div className="space-y-2 mb-4">
                    <div className="h-4 bg-gray-200 rounded-md w-full" />
                    <div className="h-4 bg-gray-200 rounded-md w-5/6" />
                </div>

                {/* Bottom Interaction Icons */}
                <div className="flex gap-8">
                    <div className="h-4 bg-gray-100 rounded-md w-12" />
                    <div className="h-4 bg-gray-100 rounded-md w-12" />
                </div>
            </div>
        </div>
    </div>
);

/**
 * Skeleton for the Channel Profile Header
 */
export const ProfileHeaderSkeleton = () => (
    <div className="animate-pulse">
        {/* Hero/Cover area */}
        <div className="w-full h-48 lg:h-80 bg-gray-200 rounded-b-[40px]" />

        <div className="px-8 -mt-24 flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b">
            <div className="flex flex-col md:flex-row md:items-end gap-6">
                {/* Large Avatar */}
                <div className="w-40 h-40 lg:w-48 lg:h-48 rounded-full bg-gray-300 border-[6px] border-white shadow-sm" />

                <div className="md:mb-4 space-y-3">
                    {/* Full Name line */}
                    <div className="h-10 bg-gray-200 rounded-xl w-64" />
                    {/* Username/Sub count line */}
                    <div className="h-4 bg-gray-100 rounded-lg w-40" />
                </div>
            </div>

            {/* Action Button */}
            <div className="md:mb-4">
                <div className="h-12 bg-gray-200 rounded-2xl w-32" />
            </div>
        </div>
    </div>
);