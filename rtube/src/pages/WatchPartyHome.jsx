import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function WatchPartyHome() {
  const [partyCode, setPartyCode] = useState("");
  const navigate = useNavigate();

  const handleJoin = () => {
    if (!partyCode.trim()) return;

    navigate(`/watch-party/${partyCode}`);
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