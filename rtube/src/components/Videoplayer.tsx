"use client";
import { useRouter } from "next/router";
import { useRef, useState, useEffect } from "react";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Maximize,
} from "lucide-react";
import { socket } from "@/socket/socket";

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

   isWatchParty?: boolean;
  partyCode?: string;
  isHost?: boolean;
}

export default function VideoPlayer({ video, nextVideo, isWatchParty = false,
  partyCode, isHost = false}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isloading, setIsLoading] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [showNext, setShowNext] = useState(false);
  const [lastTap, setLastTap] = useState(0);
  const router = useRouter();

const togglePlay = () => {
  if (isWatchParty && !isHost) {
    return;
}
  if (!videoRef.current) return;

  if (videoRef.current.paused) {
    videoRef.current.play();
    setIsPlaying(true);

    if (isWatchParty) {
      socket.emit("play-video", {
        partyCode,
        currentTime: videoRef.current.currentTime,
      });
    }
  } else {
    videoRef.current.pause();
    setIsPlaying(false);

    if (isWatchParty) {
      socket.emit("pause-video", {
        partyCode,
        currentTime: videoRef.current.currentTime,
      });
    }
  }
};

const skipForward = () => {
   if (isWatchParty && !isHost) return;
  if (!videoRef.current) return;

  videoRef.current.currentTime = Math.min(
    videoRef.current.currentTime + 10,
    duration
  );
};

const skipBackward = () => {
    if (isWatchParty && !isHost) return;
  if (!videoRef.current) return;

  videoRef.current.currentTime = Math.max(
    videoRef.current.currentTime - 10,
    0
  );
};

const handleVolume = (value: number) => {
  if (!videoRef.current) return;

  videoRef.current.volume = value;

  if (value === 0) {
    videoRef.current.muted = true;
    setIsMuted(true);
  } else {
    videoRef.current.muted = false;
    setIsMuted(false);
  }

  setVolume(value);
};

const changePlaybackSpeed = (speed: number) => {
  if (!videoRef.current) return;

  videoRef.current.playbackRate = speed;
  setPlaybackRate(speed);
};

const toggleMute = () => {
  if (!videoRef.current) return;

  if (isMuted) {
    videoRef.current.muted = false;
    setIsMuted(false);
  } else {
    videoRef.current.muted = true;
    setIsMuted(true);
  }
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

  if (isWatchParty && !isHost) return;

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

useEffect(() => {
  if (!isWatchParty) return;
  if (!videoRef.current) return;

 const handlePlay = async ({ currentTime }: { currentTime: number }) => {
  console.log("Received play event", currentTime);

  if (!videoRef.current) {
    console.log("videoRef is null");
    return;
  }

  console.log("Before play()");
  console.log("readyState:", videoRef.current.readyState);
  console.log("paused:", videoRef.current.paused);

  videoRef.current.currentTime = currentTime;

  try {
    await videoRef.current.play();
    console.log("✅ play() succeeded");
    setIsPlaying(true);
  } catch (err) {
    console.error("❌ play() failed", err);
  }
};

  const handlePause = ({ currentTime }: { currentTime: number }) => {
    if (!videoRef.current) return;

    videoRef.current.currentTime = currentTime;
    videoRef.current.pause();
    setIsPlaying(false);
  };
  const handleSeek = ({ currentTime }: { currentTime: number }) => {
  if (!videoRef.current) return;

  videoRef.current.currentTime = currentTime;
  setCurrentTime(currentTime);
};
const handleRequestVideoState = ({ target }: { target: string }) => {
  if (!isHost || !videoRef.current) return;

  socket.emit("video-state", {
    target,
    currentTime: videoRef.current.currentTime,
    isPlaying: !videoRef.current.paused,
  });
};
const handleVideoState = async ({
  currentTime,
  isPlaying,
}: {
  currentTime: number;
  isPlaying: boolean;
}) => {
  if (!videoRef.current) return;

  videoRef.current.currentTime = currentTime;

  if (isPlaying) {
    try {
      await videoRef.current.play();
      setIsPlaying(true);
    } catch (err) {
      console.error(err);
    }
  } else {
    videoRef.current.pause();
    setIsPlaying(false);
  }

  setCurrentTime(currentTime);
};

  socket.on("play-video", handlePlay);
  socket.on("pause-video", handlePause);
  socket.on("seek-video", handleSeek);
  socket.on("request-video-state", handleRequestVideoState);
  socket.on("video-state", handleVideoState);

  return () => {
    socket.off("play-video", handlePlay);
    socket.off("pause-video", handlePause);
    socket.off("seek-video", handleSeek);
    socket.off("request-video-state", handleRequestVideoState);
    socket.off("video-state", handleVideoState);
  };
}, [isWatchParty, isHost]);


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
  <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/90 via-black/60 to-transparent px-4 py-3"      onClick={(e) => e.stopPropagation()}
>
    {isWatchParty && !isHost && (
      <div className="mb-3 rounded bg-yellow-100 text-yellow-800 p-2 text-sm">
        👀 Only the host can control playback.
      </div>
    )}

    <input
      type="range"
      min={0}
      max={duration || 0}
      value={currentTime}
      disabled={isWatchParty && !isHost}
      onChange={(e) => {
        if (isWatchParty && !isHost) {
          return;
        }
        if (!videoRef.current) return;

        const newTime = Number(e.target.value);

        videoRef.current.currentTime = newTime;
        setCurrentTime(newTime);

        if (isWatchParty) {
          socket.emit("seek-video", {
            partyCode,
            currentTime: newTime,
          });
        }
      }}
     className="
w-full
h-2
accent-red-600
cursor-pointer
hover:h-3
transition-all
duration-200
"
    />

    <div className="flex items-center justify-between text-white text-sm font-medium mt-3">
      <div className="flex items-center gap-2">
        <button
          onClick={skipBackward}
          disabled={isWatchParty && !isHost}
          className="p-2 rounded-full hover:bg-white/20 transition-all duration-200"
        >
          <SkipBack size={18} />
        </button>

        <button
  onClick={(e) => {
    togglePlay();
  }}
  disabled={isWatchParty && !isHost}
  className="p-2 rounded-full bg-red-600 hover:bg-red-700 transition-all duration-200"
>
          {isPlaying ? <Pause size={22} /> : <Play size={22} />}
        </button>

        <button
          onClick={skipForward}
          disabled={isWatchParty && !isHost}
          className="p-2 rounded-full hover:bg-white/20 transition-all duration-200"
        >
          <SkipForward size={18} />
        </button>
      </div>

     <div
  className="flex items-center gap-2"
>
  <button
  onClick={(e) => {
    toggleMute();
  }}
  className="text-lg"
>
  {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
</button>

  <input
    type="range"
    min={0}
    max={1}
    step={0.01}
    value={volume}
    onChange={(e) => handleVolume(Number(e.target.value))}
    className="w-24 accent-red-600 cursor-pointer"
  />
</div>

<select
  value={playbackRate}
  onChange={(e) =>
    changePlaybackSpeed(Number(e.target.value))
  }
  className="
bg-zinc-700
text-white
rounded-md
px-3
py-1
text-sm
border-none
outline-none
cursor-pointer
hover:bg-zinc-600
"
>
  <option value={0.5}>0.5×</option>
  <option value={1}>1×</option>
  <option value={1.25}>1.25×</option>
  <option value={1.5}>1.5×</option>
  <option value={2}>2×</option>
</select>

      <button
        onClick={toggleFullscreen}
        className="px-3 py-1 bg-gray-700 rounded hover:bg-gray-600"
      >
        <Maximize size={20} />
      </button>

      <span className="text-sm font-medium whitespace-nowrap">
  {formatTime(currentTime)} / {formatTime(duration)}
</span>
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
          disabled={isWatchParty && !isHost}
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
        disabled={isWatchParty && !isHost}
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
disabled={isWatchParty && !isHost}
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
