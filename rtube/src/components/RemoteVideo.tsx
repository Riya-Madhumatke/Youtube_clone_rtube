import { useEffect, useRef } from "react";

type Props = {
  stream: MediaStream | null;
};

export default function RemoteVideo({
  stream,
}: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!videoRef.current || !stream) return;

    videoRef.current.srcObject = stream;
  }, [stream]);

  useEffect(() => {
    console.log("Remote stream:", stream);

    if (!videoRef.current || !stream) return;

    videoRef.current.srcObject = stream;

    console.log("srcObject assigned");
}, [stream]);

  return (
  <div className="bg-zinc-900 rounded-xl p-3 border border-zinc-700 shadow-lg">

    <video
      ref={videoRef}
      autoPlay
      playsInline
      className="w-full rounded-lg aspect-video bg-black object-cover"
    />

  </div>
);
}