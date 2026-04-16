// src/types/index.ts

export interface User {
  _id: string;
  username: string;
  email: string;
  fullName: string;
  avatar: { url: string; public_id: string };
  coverImage?: { url: string; public_id: string };
}

export interface Owner {
  _id: string;
  username: string;
  avatar: string;
  fullName?: string;
  coverImage: CoverImage;
  // These fields are added by our MongoDB $lookup aggregation
  isSubscribed?: boolean;
  subscribersCount?: number;
}

interface CoverImage {
  url: string;
  public_id: string;
}

// Matches the fileSchema and videoSchema in your backend
export interface Video {
  _id: string;
  videoFile: { url: string; public_id: string };
  thumbnail: { url: string; public_id: string };
  title: string;
  description: string;
  duration: number;
  views: number;
  owner: Owner; // Populated via aggregation lookup
  // NEW AGGREGATED FIELDS
  isLiked: boolean;
  likesCount: number;
  commentCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Tweet {
  _id: string;
  content: string;
  createdAt: string;
  isLiked?: boolean;
  likesCount?: number;
  owner?: User; // Populated via aggregation lookup
}

export interface ApiResponse<T> {
  status: number;
  data: T;
  message: string;
  success: boolean;
}

export interface PaginatedData<T> {
  docs: T[];
  totalDocs: number;
  limit: number;
  page: number;
  totalPages: number;
  pagingCounter: number;
  hasPrevPage: boolean;
  hasNextPage: boolean;
  prevPage: number | null;
  nextPage: number | null;
}
