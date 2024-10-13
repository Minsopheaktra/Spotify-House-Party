import React, { useState, useEffect, useCallback } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import RoomJoinPage from "./RoomJoinPage.jsx";
import CreateRoomPage from "./CreateRoomPage.jsx";
import Room from "../components/Room.jsx";
import HomePageContent from "../components/HomePageContent.jsx";
import { getUserInRoom } from "../roomApi.js";

function HomePage() {
  const [roomCode, setRoomCode] = useState(null);

  
    // Fetch the user's current room (if any) when the component mounts
  const fetchUserInRoom = async () => {
    try {
      const data = await getUserInRoom(); // API call using Axios
      setRoomCode(data.code);
    } catch (error) {
      console.error("Error fetching user-in-room:", error);
    }
  };


  useEffect(() => {
    fetchUserInRoom();
  }, []);

  // Function to clear the room code when the user leaves the room
  const clearRoomCode = useCallback(() => {
    setRoomCode(null);
  }, []);

  return (
    <Routes>
      <Route
        path="*"
        element={
          roomCode ? (
            // If the user is already in a room, redirect to that room
            <Navigate to={`/room/${roomCode}`} replace />
          ) : (
            <HomePageContent />
          )
        }
      />
      <Route path="/join" element={<RoomJoinPage />} />
      <Route path="/create" element={<CreateRoomPage />} />
      <Route
        path="/room/:roomCode"
        element={<Room leaveRoomCallback={clearRoomCode} />}
      />
    </Routes>
  );
}

export default HomePage;