"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import { MoreVertical, X, Clock, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import axiosInstance from "@/lib/axiosinstance";
import { useUser } from "@/lib/AuthContext";

export default function DownloadsContent() {
  const [downloads, setDownloads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useUser();

  useEffect(() => {
    if (user) {
      loadDownloads();
    }
  }, [user]);

  const loadDownloads = async () => {
    if (!user) return;

    try {
      const downloadsData = await axiosInstance.get(`/download/mydownloads/${user?._id}`);

      setDownloads(downloadsData.data);
    } catch (error) {
      console.error("Error loading history:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Fetching your downloads...</div>;
  }
  const handleRemoveFromDownloads = async (downloadsId: string) => {
    try {
      console.log("Removing from history:", downloadsId);
      setDownloads(downloads.filter((item) => item._id !== downloadsId));
    } catch (error) {
      console.error("Error removing from history:", error);
    }
  };

  if (!user) {
    return (
      <div className="text-center py-12">
        <Clock className="w-16 h-16 mx-auto text-gray-400 mb-4" />
        <h2 className="text-xl font-semibold mb-2">Save videos for later</h2>
        <p className="text-gray-600">
          Sign in to access your Watch later playlist.
        </p>
      </div>
    );
  }

  if (downloads.length === 0) {
    return (
      <div className="text-center py-12">
        <Clock className="w-16 h-16 mx-auto text-gray-400 mb-4" />
        <h2 className="text-xl font-semibold mb-2">No videos downloaded</h2>
        <p className="text-gray-600">
          Videos you download will appear here.
        </p>
      </div>
    );
  }
  const videos = "/video/vdo.mp4";
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
<p className="text-sm text-gray-600">
  {downloads.length} {downloads.length === 1 ? "Video" : "Videos"}
</p>        <Button
  className="flex items-center gap-2"
  onClick={() => {
    if (downloads.length > 0) {
      window.location.href = `/watch/${downloads[0].videoId._id}`;
    }
  }}
>
  <Play className="w-4 h-4" />
  Play all
</Button>
      </div>

      <div className="space-y-4">
        {downloads.map((item) => (
          <div key={item._id} className="flex gap-4 group">
            <Link href={`/watch/${item.videoId._id}`} className="flex-shrink-0">
              <div className="relative w-40 aspect-video bg-gray-100 rounded overflow-hidden">
                <video
                  src={`${process.env.NEXT_PUBLIC_BACKEND_URL}/${item.videoId?.filepath}`}
                  className="object-cover group-hover:scale-105 transition-transform duration-200"
                />
              </div>
            </Link>

            <div className="flex-1 min-w-0">
              <Link href={`/watch/${item.videoId._id}`}>
                <h3 className="font-medium text-sm line-clamp-2 group-hover:text-blue-600 mb-1">
                  {item.videoId.videotitle}
                </h3>
              </Link>
              <p className="text-sm text-gray-600">
                {item.videoId.videochanel}
              </p>
              <p className="text-sm text-gray-600">
                {item.videoId.views.toLocaleString()} views •{" "}
                {formatDistanceToNow(new Date(item.videoId.createdAt))} ago
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Added {formatDistanceToNow(new Date(item.createdAt))} ago
              </p>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="opacity-0 group-hover:opacity-100"
                >
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => handleRemoveFromDownloads(item._id)}
                >
                  <X className="w-4 h-4 mr-2" />
                  Remove from Downloads
                </DropdownMenuItem> 
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ))}
      </div>
    </div>
  );
}