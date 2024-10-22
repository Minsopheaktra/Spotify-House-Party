import React, { useState, useEffect, useCallback } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import RoomJoinPage from "./RoomJoinPage.jsx";
import CreateRoomPage from "./CreateRoomPage.jsx";
import Room from "../components/Room.jsx";
import HomePageContent from "../components/HomePageContent.jsx";
import { getUserInRoom } from "../roomApi.js";
import { checkSpotifyAuth } from '../spotifyApi';
import SpotifyProfile from "../components/SpotifyProfile.jsx";
import Logout from "../components/Logout.jsx";
import { Box } from "@mui/material";

function HomePage() {
  const [roomCode, setRoomCode] = useState(null);
  const [isSpotifyAuthenticated, setIsSpotifyAuthenticated] = useState(false);

  useEffect(() => {
      const checkAuth = async () => {
          const isSpotifyAuthenticated = await checkSpotifyAuth();
          setIsSpotifyAuthenticated(isSpotifyAuthenticated);
      };
      checkAuth();
  }, []);

  
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
    <>
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'flex-end', 
        position: 'absolute', 
        top: 16, 
        right: 16, 
        zIndex: 1000 
      }}>
        <Logout />
        {/* if the user is authenticated with Spotify, show the Spotify profile */}
        {isSpotifyAuthenticated && <SpotifyProfile />}
      </Box>
      <div className="center">
        <Routes>
          <Route
            path="*"
            element={
              roomCode ? (
                // If the user is already in a room, redirect to that room
                <Navigate to={`/room/${roomCode}`} replace />
              ) : (
                // If the user is not in a room, show the home page content
                <HomePageContent 
                  isSpotifyAuthenticated={isSpotifyAuthenticated} 
                  setIsSpotifyAuthenticated={setIsSpotifyAuthenticated} 
                />
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
      </div>
    </>
  );
}

export default HomePage;