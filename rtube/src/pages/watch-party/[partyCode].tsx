import { useRouter } from "next/router";
import { useEffect, useState, useRef } from "react";
import axiosInstance from "@/lib/axiosinstance";
import Videoplayer from "@/components/Videoplayer";
import { socket } from "@/socket/socket";
import ChatPanel from "@/components/ChatPanel";
import { useUser } from "@/lib/AuthContext";
import ParticipantsPanel from "@/components/ParticipantsPanel";
import { Copy } from "lucide-react";
import { toast } from "sonner";
import LocalVideo from "@/components/LocalVideo";
import RemoteVideo from "@/components/RemoteVideo";
import useWebRTC from "@/components/hooks/useWebRTC";
import { Mic, MicOff, Video, VideoOff, Monitor, PhoneOff } from "lucide-react";

export default function WatchPartyPage() {
  const router = useRouter();
  const { partyCode } = router.query;
  const { user } = useUser();

  const [party, setParty] = useState<any>(null);
  const isHost = !!party && user?._id === party.host._id;
  const [messages, setMessages] = useState<any[]>([]);
  const [chatMessage, setChatMessage] = useState("");
  const [remoteSocket, setRemoteSocket] = useState<string | null>(null);
  const [remoteParticipant, setRemoteParticipant] = useState<any | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const {
    peerConnection,
    localStream,
    setLocalStream,
    remoteStream,
    setRemoteStream,
    remoteSocketId,
    createOffer,
    handleOffer,
    addIceCandidate,
  } = useWebRTC({
    socket,
  });

  const copyPartyCode = async () => {
    try {
      await navigator.clipboard.writeText(party.partyCode);
      toast.success("Party code copied!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to copy party code");
    }
  };

  const handleEndParty = async () => {
    try {
      await axiosInstance.post(`/watch-party/${partyCode}/end`, {
        hostId: user?._id,
      });

      socket.emit("end-party", {
        partyCode,
      });
    } catch (err) {
      console.error(err);
    }
  };

  const copyInviteLink = async () => {
    try {
      const inviteLink = `${window.location.origin}/watch-party/${party.partyCode}`;

      await navigator.clipboard.writeText(inviteLink);

      toast.success("Invite link copied!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to copy invite link");
    }
  };

  const toggleMute = () => {
    if (!localStream) return;

    const audioTrack = localStream.getAudioTracks()[0];

    if (!audioTrack) return;

    audioTrack.enabled = !audioTrack.enabled;

    setIsMuted(!audioTrack.enabled);
  };

  const toggleCamera = () => {
    if (!localStream) return;

    const videoTrack = localStream.getVideoTracks()[0];

    if (!videoTrack) return;

    videoTrack.enabled = !videoTrack.enabled;

    setIsCameraOff(!videoTrack.enabled);
  };

  const toggleScreenShare = async () => {
    console.log("Screen Share button clicked");

    if (!peerConnection.current) {
      console.log("peerConnection is null");
      return;
    }

    if (!localStream) {
      console.log("localStream is null");
      return;
    }

    console.log("Calling getDisplayMedia...");

    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
      });

      console.log("Screen selected!");

      const screenTrack = screenStream.getVideoTracks()[0];
      const sender = peerConnection.current
        .getSenders()
        .find((s) => s.track?.kind === "video");
      console.log(sender);
      console.log(
        peerConnection.current?.getSenders().map((s) => ({
          kind: s.track?.kind,
          id: s.track?.id,
        })),
      );
      if (sender) {
        console.log("===== BEFORE =====");
        peerConnection.current?.getSenders().forEach((s) => {
          console.log(s.track?.kind, s.track?.label);
        });
        await sender.replaceTrack(screenTrack);
        console.log("===== AFTER =====");
        peerConnection.current?.getSenders().forEach((s) => {
          console.log(s.track?.kind, s.track?.label);
        });
        console.log("✅ Replaced camera with screen track");
      }
      console.log("Screen Track:", screenTrack);

      if (videoRef.current) {
        videoRef.current.srcObject = screenStream;
      }

      screenTrack.onended = async () => {
        const cameraTrack = localStream.getVideoTracks()[0];

        const sender = peerConnection.current
          ?.getSenders()
          .find((s) => s.track?.kind === "video");

        if (sender && cameraTrack) {
          await sender.replaceTrack(cameraTrack);
          console.log("✅ Camera restored");
        }

        if (videoRef.current) {
          videoRef.current.srcObject = localStream;
        }
      };
      // Stop here for now
    } catch (err) {
      console.error("Screen Share Error:", err);
    }
  };

  const leaveCall = () => {
    // Stop camera and microphone
    localStream?.getTracks().forEach((track) => track.stop());

    // Stop remote stream (if any)
    remoteStream?.getTracks().forEach((track) => track.stop());

    // Close WebRTC connection
    peerConnection.current?.close();

    // Inform other participants
    socket.emit("leave-party");

    // Redirect user
    router.push("/");
  };

  useEffect(() => {
    if (!partyCode) return;

    const fetchParty = async () => {
      try {
        const res = await axiosInstance.get(`/watch-party/${partyCode}`);

        setParty(res.data.party);
      } catch (err: any) {
        if (err.response?.status === 410) {
          toast.error("This watch party has ended.");
          router.push("/");
          return;
        }

        console.error(err);
      }
    };

    fetchParty();
  }, [partyCode]);

  useEffect(() => {
    if (!party || !user) return;

    if (!socket.connected) {
      socket.connect();
    }

    console.log("Joining as:", user);
    console.log("HOST emitting join-party");
    socket.emit("join-party", {
      partyCode: party.partyCode,
      user: {
        _id: user._id,
        name: user.name,
        image: user.image,
      },
    });

    console.log("Joined room:", party.partyCode);

    return () => {
      socket.emit("leave-party", party.partyCode);
    };
  }, [party, user]);

  useEffect(() => {
    if (peerConnection.current) return;
  }, []);

  useEffect(() => {
    const handleUserJoined = (user: any) => {
      console.log("User joined:", user);
      remoteSocketId.current = user.socketId;
      setRemoteSocket(user.socketId);
      setRemoteParticipant(user);
    };

    socket.on("user-joined-call", handleUserJoined);

    return () => {
      socket.off("user-joined-call", handleUserJoined);
    };
  }, []);

  useEffect(() => {
    const startOffer = async () => {
      if (!peerConnection.current) return;
      if (!remoteSocket) return;
      if (!localStream) return;

      console.log("Creating offer...");

      const senders = peerConnection.current.getSenders();

      if (senders.length === 0) {
        console.log("Tracks not added yet.");
        return;
      }

      await createOffer();
    };
    startOffer();
  }, [remoteSocket, localStream]);

  useEffect(() => {
    const onOffer = async ({
      offer,
      sender,
    }: {
      offer: RTCSessionDescriptionInit;
      sender: string;
    }) => {
      console.log("Offer received");
      console.log("🔥 webrtc-offer event fired");
      console.log("Sender:", sender);

      await handleOffer(offer, sender);
    };

    socket.on("webrtc-offer", onOffer);

    return () => {
      socket.off("webrtc-offer", onOffer);
    };
  }, [handleOffer, socket]);

  useEffect(() => {
    const handleAnswer = async ({
      answer,
    }: {
      answer: RTCSessionDescriptionInit;
    }) => {
      console.log("Answer received");

      if (!peerConnection.current) return;

      await peerConnection.current.setRemoteDescription(
        new RTCSessionDescription(answer),
      );

      console.log("Remote description set on host");
    };

    socket.on("webrtc-answer", handleAnswer);

    return () => {
      socket.off("webrtc-answer", handleAnswer);
    };
  }, []);

  useEffect(() => {
    const handleIceCandidate = async ({
      candidate,
    }: {
      candidate: RTCIceCandidateInit;
    }) => {
      console.log("ICE candidate received");

      if (!peerConnection.current) return;
      console.log(
        "Remote description:",
        peerConnection.current.remoteDescription,
      );

      try {
        await addIceCandidate(candidate);

        console.log("ICE candidate added");
      } catch (err) {
        console.error("ICE error:", err);
      }
    };

    socket.on("ice-candidate", handleIceCandidate);

    return () => {
      socket.off("ice-candidate", handleIceCandidate);
    };
  }, []);

  useEffect(() => {
    const handlePartyEnded = () => {
      toast.success("The host has ended the watch party.");

      router.push("/");
    };

    socket.on("party-ended", handlePartyEnded);

    return () => {
      socket.off("party-ended", handlePartyEnded);
    };
  }, [router]);

  useEffect(() => {
    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    return () => {
      if (peerConnection.current) {
        peerConnection.current.close();
        peerConnection.current = null;
      }
    };
  }, []);

  if (!party) return <div>Party not found</div>;

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white p-6">
      <div className="flex items-center justify-between mb-6">
        {/* Left */}
        <div>
          <h1 className="text-3xl font-bold">🎉 Watch Party</h1>

          <p className="text-gray-400 text-sm">
            Watch videos together in real time
          </p>
        </div>

        {/* Right */}
        <div className="flex items-center gap-4">
          <div className="bg-zinc-900 rounded-xl px-4 py-2 flex items-center gap-3">
            <div>
              <p className="text-xs text-gray-400">Party Code</p>

              <p className="font-bold tracking-widest">{party.partyCode}</p>
            </div>

            <button onClick={copyPartyCode} className="hover:text-red-500">
              <Copy className="w-5 h-5" />
            </button>

            <button onClick={copyInviteLink}>🔗</button>
          </div>

          {isHost && (
            <button
              onClick={handleEndParty}
              className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg"
            >
              End Party
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* LEFT SIDE */}
        <div className="xl:col-span-8 space-y-5">
          <Videoplayer
            video={party.video}
            nextVideo={null}
            isWatchParty
            partyCode={party.partyCode}
            isHost={isHost}
          />

          <div className="flex flex-wrap justify-center gap-3">
            <button
              onClick={toggleMute}
              className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 px-5 py-3 rounded-xl transition"
            >
              {isMuted ? <MicOff size={18} /> : <Mic size={18} />}
              {isMuted ? "Unmute" : "Mute"}
            </button>

            <button
              onClick={toggleCamera}
              className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 px-5 py-3 rounded-xl transition"
            >
              {isCameraOff ? <VideoOff size={18} /> : <Video size={18} />}
              {isCameraOff ? "Camera On" : "Camera Off"}
            </button>

            <button
              onClick={toggleScreenShare}
              className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 px-5 py-3 rounded-xl transition"
            >
              <Monitor size={18} />
              Share Screen
            </button>

            <button
              onClick={leaveCall}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-700 px-5 py-3 rounded-xl transition"
            >
              <PhoneOff size={18} />
              Leave Party
            </button>
          </div>

          <div className="bg-zinc-900 rounded-xl p-4">
            {/* Buttons will go here in Step 3 */}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-zinc-400 mb-2">You</p>

              <LocalVideo onStreamReady={setLocalStream} />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-white">
                  {remoteParticipant?.name || "Participant"}
                </p>

                <div className="w-2 h-2 rounded-full bg-green-500"></div>
              </div>

              <RemoteVideo stream={remoteStream} />
            </div>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="xl:col-span-4 space-y-5">
          <ParticipantsPanel
            partyCode={party.partyCode}
            hostId={party.host._id}
          />

          <ChatPanel partyCode={party.partyCode} />
        </div>
      </div>
    </div>
  );
}