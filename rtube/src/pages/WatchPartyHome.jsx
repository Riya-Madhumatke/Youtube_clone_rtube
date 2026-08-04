import { useState } from "react";
import { useRouter } from "next/router";

export default function WatchPartyHome() {
  const [partyCode, setPartyCode] = useState("");
  const router = useRouter();

  const handleJoin = () => {
    if (!partyCode.trim()) return;

    router.push(`/watch-party/${partyCode}`);
  };

  return (
    <div className="watch-party-home">

      <h2>🎉 Watch Party</h2>

      <p>
        Watch videos together with your friends.
      </p>

      <hr />

      <input
        placeholder="Enter Party Code"
        value={partyCode}
        onChange={(e) =>
          setPartyCode(e.target.value)
        }
      />

      <button onClick={handleJoin}>
        Join Party
      </button>

    </div>
  );
}