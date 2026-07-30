import { useState } from "react";
import { useRouter } from "next/router";
import LocalVideo from "@/components/LocalVideo";
import { useRef } from "react";


export default function WatchPartyHome() {
  const [partyCode, setPartyCode] = useState("");
  const router = useRouter();
  const joinParty = () => {
    if (!partyCode.trim()) return;

    router.push(`/watch-party/${partyCode}`);
  };

  return (
    <div className="flex-1 p-8">

      <h1 className="text-3xl font-bold">
        🎉 Watch Party
      </h1>

      <p className="text-gray-500 mt-2">
        Watch videos together in real time.
      </p>

    

      <div className="mt-10 max-w-md">

        <input
          value={partyCode}
          onChange={(e) =>
            setPartyCode(e.target.value)
          }
          placeholder="Enter Party Code"
          className="w-full border rounded-lg p-3"
        />

        <button
          onClick={joinParty}
          className="mt-4 w-full bg-red-600 text-white rounded-lg py-3"
        >
          Join Party
        </button>

      </div>

    </div>
  );
}