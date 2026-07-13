"use client";
import { useRouter } from "next/router";
import { useRef, useState, useEffect } from "react";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  Maximize,
} from "lucide-react";

interface VideoPlayerProps {
  video: {
    _id: string;
    videotitle: string;
    filepath: string;
  };

  nextVideo?: {
    _id: string;
    videotitle: string;
  } | null;
}

export default function VideoPlayer({ video, nextVideo, }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isloading, setIsLoading] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [showNext, setShowNext] = useState(false);
  const [lastTap, setLastTap] = useState(0);
  const router = useRouter();

  const togglePlay = () => {
  if (!videoRef.current) return;

  if (videoRef.current.paused) {
    videoRef.current.play();
    setIsPlaying(true);
  } else {
    videoRef.current.pause();
    setIsPlaying(false);
  }
};

const skipForward = () => {
  if (!videoRef.current) return;

  videoRef.current.currentTime = Math.min(
    videoRef.current.currentTime + 10,
    duration
  );
};

const skipBackward = () => {
  if (!videoRef.current) return;

  videoRef.current.currentTime = Math.max(
    videoRef.current.currentTime - 10,
    0
  );
};

const handleVolume = (value: number) => {
  if (!videoRef.current) return;

  videoRef.current.volume = value;
  setVolume(value);
};

const toggleFullscreen = async () => {
  if (!playerRef.current || !videoRef.current) return;

  const wasPlaying = !videoRef.current.paused;

  if (!document.fullscreenElement) {
    await playerRef.current.requestFullscreen();
  } else {
    await document.exitFullscreen();
  }

  // Resume playback if it was playing before fullscreen
  if (wasPlaying) {
    setTimeout(() => {
      videoRef.current?.play();
    }, 100);
  }
};

const showPlayerControls = () => {
  setShowControls(true);

  clearTimeout((window as any).hideTimer);

  (window as any).hideTimer = setTimeout(() => {
    if (isPlaying) {
      setShowControls(false);
    }
  }, 3000);
};

const handleDoubleTap = (e: React.MouseEvent<HTMLDivElement>) => {
  const now = Date.now();
  const DOUBLE_TAP_DELAY = 300;

  if (now - lastTap < DOUBLE_TAP_DELAY) {
    if (!playerRef.current || !videoRef.current) return;

    const rect = playerRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;

    if (clickX < rect.width / 2) {
      skipBackward();
    } else {
      skipForward();
    }
  }

  setLastTap(now);
};

useEffect(() => {
  setShowNext(false);
  setIsPlaying(false);
}, [video._id]);

useEffect(() => {
  const video = videoRef.current;

  if (!video) return;

  const updateTime = () => {
    setCurrentTime(video.currentTime);
  };

  const loadedMetadata = () => {
    setDuration(video.duration);
  };

  video.addEventListener("timeupdate", updateTime);
  video.addEventListener("loadedmetadata", loadedMetadata);

  return () => {
    video.removeEventListener("timeupdate", updateTime);
    video.removeEventListener("loadedmetadata", loadedMetadata);
  };
}, []);
const formatTime = (time: number) => {
  if (isNaN(time)) return "0:00";

  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);

  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
};
  
  return (
<div
  ref={playerRef}
  className="relative aspect-video bg-black rounded-lg overflow-hidden cursor-pointer"
  onClick={togglePlay}
    onMouseMove={showPlayerControls}
    onDoubleClick={handleDoubleTap}
>   
     <video
  ref={videoRef}
  className="w-full h-full cursor-pointer"
  controls={false}
  onPlay={() => setIsPlaying(true)}
  onPause={() => setIsPlaying(false)}
onEnded={() => {
  setIsPlaying(false);
  setShowNext(true);
}}  onWaiting={() => setIsLoading(true)}
  onCanPlay={() => setIsLoading(false)}
>
        <source
    src={`${process.env.NEXT_PUBLIC_BACKEND_URL}/${video?.filepath.replace(/\\/g, "/")}`}
          type="video/mp4"
        />
        Your browser does not support the video tag.
      </video>
{showControls && (
  <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/90 via-black/60 to-transparent px-4 py-3">
    <input
      type="range"
      min={0}
      max={duration || 0}
      value={currentTime}
      onChange={(e) => {
        if (!videoRef.current) return;

        videoRef.current.currentTime = Number(e.target.value);
        setCurrentTime(Number(e.target.value));
      }}
className="w-full accent-red-600 cursor-pointer"    />

    <div className="flex items-center justify-between text-white text-sm font-medium mt-3">
      LEFT
▶
⏪
⏩
🔊

CENTER
(Time)

RIGHT
⛶  
      <div className="flex items-center gap-2">
        <button
          onClick={skipBackward}
         className="p-2 rounded-full hover:bg-white/20 transition-all duration-200"
        >
      <SkipBack size={10} />
        </button>

        <button
          onClick={togglePlay}
className="p-3 rounded-full bg-red-600 hover:bg-red-700 transition-all duration-200"        >
{isPlaying ? <Pause size={22} /> : <Play size={22} />}      
  </button>

        <button
          onClick={skipForward}
className="p-2 rounded-full hover:bg-white/20 transition-all duration-200"        >
          <SkipForward size={10} />
        </button>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-lg"><Volume2 size={20} /></span>

        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={volume}
          onChange={(e) => handleVolume(Number(e.target.value))}
className="w-24 accent-red-600 cursor-pointer"        />
      </div>

      <button
        onClick={toggleFullscreen}
        className="px-3 py-1 bg-gray-700 rounded hover:bg-gray-600"
      >
   <Maximize size={20} />  
       </button>

      <span>{formatTime(currentTime)}</span>
      <span>{formatTime(duration)}</span>
    </div>
  </div>
)}
{isloading && (
  <div className="absolute inset-0 flex items-center justify-center bg-black/30">
    <div className="w-14 h-14 border-4 border-[5px] border-white border-t-transparent rounded-full animate-spin"></div>
  </div>
)}
{!isPlaying && (
  <div className="absolute inset-0 flex items-center justify-center">
    <button
      onClick={(e) => {
        e.stopPropagation();
        togglePlay();
      }}
      className="bg-black/60 text-white px-6 py-3 rounded-full hover:bg-black/80 transition"
    >
      ▶ Play
    </button>
  </div>
)}
{showNext && nextVideo && (
  <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center gap-4">
    <h2 className="text-white text-2xl font-bold">
      Video Finished
    </h2>

    <div className="flex gap-4">
      <button
        onClick={() => {
          setShowNext(false);
          videoRef.current?.play();
        }}
        className="bg-red-600 text-white px-6 py-3 rounded-lg"
      >
        Replay
      </button>

      <button
      onClick={() => {
  console.log("Next video:", nextVideo);
   if (nextVideo) {
  router.push(`/watch/${nextVideo._id}`);
}}}
        className="bg-white text-black px-6 py-3 rounded-lg"
      >
        Next Video
        
      </button>
      
    </div>
  </div>
)}
    </div>
  );
}