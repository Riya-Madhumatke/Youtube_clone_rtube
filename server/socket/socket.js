import WatchParty from "../Models/watchParty.js";
import WatchPartyMessage from "../Models/WatchPartyMessage.js";

const activeRooms = {};

export const initializeSocket = (io) => {
  io.on("connection", (socket) => {

    socket.on("webrtc-offer", ({ offer, target }) => {
  console.log("📤 Server forwarding OFFER");
  console.log("Sender:", socket.id);
  console.log("Target:", target);
      io.to(target).emit("webrtc-offer", {
    offer,
    sender: socket.id,
  });
});

socket.on("webrtc-answer", ({ answer, target }) => {
  io.to(target).emit("webrtc-answer", {
    answer,
    sender: socket.id,
  });
});

socket.on("ice-candidate", ({ candidate, target }) => {
    console.log("📤 Server forwarding ICE");
  console.log("Sender:", socket.id);
  console.log("Target:", target);
  io.to(target).emit("ice-candidate", {
    candidate,
    sender: socket.id,
  });
});

    socket.on("join-party", ({ partyCode, user }) => {

      socket.join(partyCode);

      console.log("JOIN REQUEST");
console.log("Party:", partyCode);
console.log("User:", user);
console.log("Socket:", socket.id);

      if (!activeRooms[partyCode]) {
        activeRooms[partyCode] = [];
      }

      const exists = activeRooms[partyCode].find(
  (u) => u.userId === user._id
);

      if (!exists) {
        activeRooms[partyCode].push({
          socketId: socket.id,
          userId: user._id,
          name: user.name,
          image: user.image,
        });
        const host = activeRooms[partyCode][0];

if (host && host.socketId !== socket.id) {
  io.to(host.socketId).emit("request-video-state", {
    target: socket.id,
  });
}
        console.log("Room members before emit:", activeRooms[partyCode]);
console.log("Emitting user-joined-call from:", socket.id);
        socket.to(partyCode).emit("user-joined-call", {
  socketId: socket.id,
  userId: user._id,
  name: user.name,
});
console.log("Emitting participants-update");
console.log(activeRooms[partyCode]);
      io.to(partyCode).emit(
        "participants-update",
        activeRooms[partyCode]
      );
    socket.to(partyCode).emit("system-message", {
    type: "join",
    text: `${user.name} joined the watch party`,
    time: new Date().toLocaleTimeString(),
});
      }
      console.log("Current participants:", activeRooms[partyCode]);
    });

   socket.on("send-message", async ({ partyCode, message }) => {
  try {
    const party = await WatchParty.findOne({ partyCode });

    if (!party) return;

    const savedMessage = await WatchPartyMessage.create({
      party: party._id,
      sender: message.senderId || null,
      senderName: message.sender,
      text: message.text,
      type: "chat",
    });

    io.to(partyCode).emit("receive-message", {
      _id: savedMessage._id,
      sender: savedMessage.sender,
      senderName: savedMessage.senderName,
      text: savedMessage.text,
      type: savedMessage.type,
      createdAt: savedMessage.createdAt,
    });
  } catch (err) {
    console.error("Chat save error:", err);
  }
});

    socket.on("play-video", ({ partyCode, currentTime }) => {
      socket.to(partyCode).emit("play-video", {
        currentTime,
      });

      console.log(
        `Play event sent to room ${partyCode} at ${currentTime}s`
      );
    });

    socket.on("pause-video", ({ partyCode, currentTime }) => {
      socket.to(partyCode).emit("pause-video", {
        currentTime,
      });

      console.log(
        `Pause event sent to room ${partyCode} at ${currentTime}s`
      );
    });

    socket.on("seek-video", ({ partyCode, currentTime }) => {
      socket.to(partyCode).emit("seek-video", {
        currentTime,
      });

      console.log(
        `Seek event sent to room ${partyCode} at ${currentTime}s`
      );
    });

    socket.on("video-state", ({ target, currentTime, isPlaying }) => {
  io.to(target).emit("video-state", {
    currentTime,
    isPlaying,
  });
   console.log(
    `Video state sent to ${target} at ${currentTime}s (${isPlaying ? "playing" : "paused"})`
  );
});

    socket.on("end-party", ({ partyCode }) => {
  io.to(partyCode).emit("party-ended");
});

   socket.on("disconnect", () => {
  console.log("User disconnected:", socket.id);

  for (const partyCode in activeRooms) {
    const leavingUser = activeRooms[partyCode].find(
      (u) => u.socketId === socket.id
    );

    if (!leavingUser) continue;

    
    activeRooms[partyCode] = activeRooms[partyCode].filter(
      (u) => u.socketId !== socket.id
    );

    
    io.to(partyCode).emit(
      "participants-update",
      activeRooms[partyCode]
    );

    
    io.to(partyCode).emit("system-message", {
      type: "leave",
      text: `${leavingUser.name} left the watch party`,
      time: new Date().toLocaleTimeString(),
    });

    console.log(`${leavingUser.name} left ${partyCode}`);
  }
});
  });
};