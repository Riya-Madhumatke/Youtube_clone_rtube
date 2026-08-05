import { useEffect, useState } from "react";
import { socket } from "@/socket/socket";
import { useUser } from "@/lib/AuthContext";

interface Participant {
  socketId: string;
  userId: string;
  name: string;
  image: string;
}

interface Props {
  partyCode: string;
  hostId: string;
}

export default function ParticipantsPanel({ partyCode, hostId }: Props) {
  const { user } = useUser();

  const [participants, setParticipants] = useState<Participant[]>([]);
  const remoteParticipant = participants.find(
    (participant) => String(participant.userId) !== String(user?._id),
  );
  {
    remoteParticipant?.name ?? "Participant";
  }

  useEffect(() => {
    const handleParticipants = (users: Participant[]) => {
      console.log("Participants update:", users);

      setParticipants(users);
    };

    socket.on("participants-update", handleParticipants);

    return () => {
      socket.off("participants-update", handleParticipants);
    };
  }, []);

  return (
    <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-5 shadow-lg">
      <h2 className="text-lg font-semibold mb-4 text-white">
        Participants ({participants.length})
      </h2>

      {participants.map((participant) => (
        <div
          key={participant.socketId}
          className="flex items-center gap-3 p-3 rounded-lg hover:bg-zinc-800 transition"
        >
          <img
            src={participant.image}
            className="w-12 h-12 rounded-full border-2 border-red-500"
          />

          <div className="flex flex-col">
            <span className="font-semibold text-white">
              {participant.name}

              {participant.userId === hostId && (
                <span className="ml-2 text-yellow-500">👑 Host</span>
              )}

              {participant.userId === user?._id && (
                <span className="ml-2 text-green-600">(You)</span>
              )}
            </span>

            <span className="text-green-600 text-sm">
              <div className="flex items-center gap-2 text-sm text-green-400">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                Online
              </div>
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}