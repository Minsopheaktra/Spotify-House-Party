import React, { useState, useEffect, useCallback } from "react";
import { Grid, Button, Typography } from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import CreateRoomPage from "../pages/CreateRoomPage.jsx";
import MusicPlayer from "./MusicPlayer";
import { getRoomDetails, leaveRoom } from "../roomApi.js"
import {authenticateSpotify, getCurrentSong} from "../spotifyApi.js"

function Room({ leaveRoomCallback }) {
	const [votesToSkip, setVotesToSkip] = useState(2);
	const [guestCanPause, setGuestCanPause] = useState(false);
	const [isHost, setIsHost] = useState(false);
	const [showSettings, setShowSettings] = useState(false);
	const [spotifyAuthenticated, setSpotifyAuthenticated] = useState(false);
	const [song, setSong] = useState({});

	const { roomCode } = useParams();
	const navigate = useNavigate();

	useEffect(() => {
		const intervalId = setInterval(() => {
		  getCurrentSong().then(setSong);
		}, 1000);
		return () => clearInterval(intervalId);
	  }, []);

	const updateSongStatus = (isPlaying) => {
		setSong((prevSong) => ({
			...prevSong,
			is_playing: isPlaying,
		}));
	};

	const fetchRoomDetails = useCallback(async () => {
		try {
		  const data = await getRoomDetails(roomCode);
		  setVotesToSkip(data.votes_to_skip);
		  setGuestCanPause(data.guest_can_pause);
		  setIsHost(data.is_host);
		} catch (error) {
		  console.error("Error fetching room details:", error);
		  leaveRoomCallback();
		  navigate("/");
		}
	  }, [roomCode, leaveRoomCallback, navigate]);

	  useEffect(() => {
		fetchRoomDetails();
	  }, [fetchRoomDetails]);

	useEffect(() => {
		if (isHost) {
			authenticateSpotify();
		}
	}, [isHost, authenticateSpotify]);

	const leaveButtonPressed = async () => {
		await leaveRoom();
		leaveRoomCallback();
		navigate('/');
	};

	const renderSettingsButton = () => (
		<Grid item xs={12} align="center">
			<Button
				variant="contained"
				color="primary"
				onClick={() => setShowSettings(true)}
			>
				Settings
			</Button>
		</Grid>
	);

	const renderSettings = () => (
		<Grid container spacing={1}>
			<Grid item xs={12} align="center">
				<CreateRoomPage
					update={true}
					votesToSkip={votesToSkip}
					guestCanPause={guestCanPause}
					roomCode={roomCode}
					updateCallback={getRoomDetails}
				/>
			</Grid>
			<Grid item xs={12} align="center">
				<Button
					variant="contained"
					color="secondary"
					onClick={() => setShowSettings(false)}
				>
					Close
				</Button>
			</Grid>
		</Grid>
	);

	if (showSettings) {
		return renderSettings();
	}

	return (
		<Grid container spacing={1}>
			<Grid item xs={12} align="center">
				<Typography variant="h4" component="h4">
					Code: {roomCode}
				</Typography>
			</Grid>
			<MusicPlayer {...song} updateSongStatus={updateSongStatus} />
			{isHost && renderSettingsButton()}
			<Grid item xs={12} align="center">
				<Button
					variant="contained"
					color="secondary"
					onClick={leaveButtonPressed}
				>
					Leave Room
				</Button>
			</Grid>
		</Grid>
	);
}

export default Room;