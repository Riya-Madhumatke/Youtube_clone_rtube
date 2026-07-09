"use client";

import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Avatar, AvatarFallback } from "./ui/avatar";

export default function VideoCard({ video }: any) {
  const videoUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL}/${video.filepath.replace(/\\/g, "/")}`;

  return (
    <Link href={`/watch/${video._id}`} className="group">
      <div className="space-y-3">
        <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-100">
          <video
            src={videoUrl}
            controls
            preload="metadata"
            className="w-full h-full object-cover"
          />

          <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-1 rounded">
            10:24
          </div>
        </div>

        <div className="flex gap-3">
          <Avatar className="w-9 h-9">
            <AvatarFallback>
              {video?.videochanel?.[0] || "U"}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1">
            <h3 className="font-medium text-sm line-clamp-2">
              {video.videotitle}
            </h3>

            <p className="text-sm text-gray-600">
              {video.videochanel}
            </p>

            <p className="text-sm text-gray-600">
              {(video.views ?? 0).toLocaleString()} views •{" "}
              {formatDistanceToNow(new Date(video.createdAt))} ago
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
}