import { useEffect, useRef } from "react";

type LocalVideoProps = {
  onStreamReady: (stream: MediaStream) => void;
};

export default function LocalVideo({
  onStreamReady,
}: LocalVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

 useEffect(() => {
  let stream: MediaStream | null = null;

  const startCamera = async () => {
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      onStreamReady(stream);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Camera error:", err);

      try {
        stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });

        console.log("Audio-only stream started");

        onStreamReady(stream);
      } catch (e) {
        console.error("Audio also failed:", e);
      }
    }
  };

  startCamera();

  return () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    if (videoRef.current) {
    videoRef.current.srcObject = null;
  }
  };
}, [onStreamReady]);



return (
  <div className="bg-zinc-900 rounded-xl p-3 border border-zinc-700 shadow-lg">

    <div className="flex items-center justify-between mb-2">
      <h3 className="text-sm font-semibold text-white">
        You
      </h3>

      <div className="w-2 h-2 rounded-full bg-green-500"></div>
    </div>

    <video
      ref={videoRef}
      autoPlay
      playsInline
      muted
      className="w-full rounded-lg aspect-video bg-black object-cover"
    />

  </div>
);
}