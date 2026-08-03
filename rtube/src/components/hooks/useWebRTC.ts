import { useRef, useState, useEffect } from "react";
import { Socket } from "socket.io-client";
import { useCallback } from "react";


type Props = {
  socket: Socket;
};

export default function useWebRTC({
  socket,
}: Props) {
  const peerConnection =
    useRef<RTCPeerConnection | null>(null);
  const [localStream, setLocalStream] =
    useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] =
    useState<MediaStream | null>(null);
    const remoteSocketId = useRef<string | null>(null);
    const pendingIceCandidates = useRef<RTCIceCandidateInit[]>([]);

  useEffect(() => {
  if (peerConnection.current) return;

  const pc = new RTCPeerConnection({
    iceServers: [
      {
        urls: "stun:stun.l.google.com:19302",
      },
    ],
  });

  pc.onicecandidate = (event) => {
  if (!event.candidate) return;
    if (!remoteSocketId.current) return;

  console.log("Sending ICE candidate");

  socket.emit("ice-candidate", {
    candidate: event.candidate,
    target: remoteSocketId.current,
  });
};

pc.ontrack = (event) => {
  const stream = event.streams[0];

  console.log("================================");
  console.log("Track received:", event.track.kind);
  console.log(
    "Video tracks:",
    stream.getVideoTracks().length
  );
  console.log(
    "Audio tracks:",
    stream.getAudioTracks().length
  );

  stream.getTracks().forEach((track) => {
    console.log("Track:", track.kind, track.id);
  });

  setRemoteStream(stream);
};
  
  peerConnection.current = pc;

  console.log("✅ RTCPeerConnection created");
}, []);

useEffect(() => {
  if (!localStream) return;
  if (!peerConnection.current) return;

  const existingTrackIds = new Set(
    peerConnection.current
      .getSenders()
      .map(sender => sender.track?.id)
      .filter(Boolean)
  );

console.log("=== addTrack effect ===");
  localStream.getTracks().forEach(track => {
     console.log("Adding track:", track.kind);
    if (!existingTrackIds.has(track.id)) {
      peerConnection.current!.addTrack(track, localStream);
      console.log(
        "Sending:",
        track.kind,
        track.readyState,
        track.enabled
    );
    }
  });
  console.log(
     "Senders after addTrack:",
    peerConnection.current.getSenders().map(s => s.track?.kind)
  );
}, [localStream, peerConnection]);


const createOffer = useCallback(async () => {
  console.log("=== createOffer() called ===");

  if (!peerConnection.current) {
    console.log("❌ peerConnection is null");
    return;
  }

  if (!localStream) {
    console.log("❌ localStream is null");
    return;
  }

  if (!remoteSocketId.current) {
    console.log("❌ remoteSocketId is null");
    return;
  }
   console.log(
    "Senders before createOffer:",
    peerConnection.current
      .getSenders()
      .map((s) => s.track?.kind)
  );

  console.log("✅ Creating SDP offer");

  const offer = await peerConnection.current.createOffer();
console.log(offer.sdp);
  console.log("✅ Offer created");

  await peerConnection.current.setLocalDescription(offer);

  console.log("✅ Local description set");

  console.log("🚀 Emitting webrtc-offer");

  socket.emit("webrtc-offer", {
    offer,
    target: remoteSocketId.current,
  });

  console.log("✅ Offer emitted");
}, [localStream, socket]);

const handleOffer = useCallback(
  async (
    offer: RTCSessionDescriptionInit,
    sender: string
  ) => {
    remoteSocketId.current = sender;

    if (!peerConnection.current) return;

    try {
      await peerConnection.current.setRemoteDescription(
        new RTCSessionDescription(offer)
      );
      while (pendingIceCandidates.current.length > 0) {
  const candidate = pendingIceCandidates.current.shift()!;
    await peerConnection.current.addIceCandidate(
    new RTCIceCandidate(candidate)
  );
}

console.log("Queued ICE flushed");

      const answer = await peerConnection.current.createAnswer();

      await peerConnection.current.setLocalDescription(answer);

      socket.emit("webrtc-answer", {
        answer,
        target: sender,
      });

      console.log("Answer sent");
    } catch (err) {
      console.error("Offer handling error:", err);
    }
  },
  [socket]
);

const addIceCandidate = useCallback(
  async (candidate: RTCIceCandidateInit) => {
    if (!peerConnection.current) return;

    if (!peerConnection.current.remoteDescription) {
      console.log("Remote description not ready. Queuing ICE.");
      pendingIceCandidates.current.push(candidate);
      return;
    }

    await peerConnection.current.addIceCandidate(
      new RTCIceCandidate(candidate)
    );

    console.log("ICE candidate added");
  },
  []
);

  return {
    peerConnection,
    localStream,
    setLocalStream,
    remoteStream,
    setRemoteStream,
    remoteSocketId,
    createOffer,
    handleOffer,
    addIceCandidate
  };
}