import React, { useEffect, useState } from "react";
import api from "../api/axios";
import type { Video, ApiResponse } from "../types";

export const History = () => {
  const [history, setHistory] = useState<Video[]>([]);

  useEffect(() => {
    const fetchHistory = async () => {
      const { data } = await api.get<ApiResponse<Video[]>>("/users/history");
      setHistory(data.data);
    };
    fetchHistory();
  }, []);

  return (
    <div>
      <h2 className="text-xl font-bold p-4">Your Watch History</h2>
      {history.map((video) => (
        <div key={video._id} className="flex gap-4 p-2 border-b">
          <img src={video.thumbnail.url} className="w-32 h-20 object-cover" />
          <div>
            <p className="font-semibold">{video.title}</p>
            <p className="text-sm text-gray-500">{video.owner?.username}</p>
          </div>
        </div>
      ))}
    </div>
  );
};
