import React, { useState, useEffect } from "react";
import { Button, Typography } from "@mui/material";
import {
	playSongAlong,
	pauseSongAlong,
	checkSpotifyPremium,
} from "../spotifyApi";

const SpotifyPlayer = ({ currentSong, isHost }) => {
	const [isPlaying, setIsPlaying] = useState(false);
	const [isPremium, setIsPremium] = useState(null);

	useEffect(() => {
		const checkPremium = async () => {
			const premium = await checkSpotifyPremium();
			setIsPremium(premium);
		};
		checkPremium();
	}, []);

	const handleTogglePlay = async () => {
		if (!isPremium) {
			console.log("Spotify Premium is required for Listen Along feature");
			return;
		}

		if (isPlaying) {
			try {
				await pauseSongAlong();
				setIsPlaying(false);
			} catch (error) {
				console.error("Error pausing:", error);
			}
		} else {
			if (currentSong && currentSong.id) {
				try {
					const uri = `spotify:track:${currentSong.id}`; // Convert ID to URI
					await playSongAlong(uri, currentSong.time);
					setIsPlaying(true);
				} catch (error) {
					console.error("Error playing:", error);
				}
			} else {
				console.error("No current song or URI available");
			}
		}
	};

	if (isHost) return null;

	if (isPremium === null) {
		return <Typography>Checking Spotify Premium status...</Typography>;
	}

	if (!isPremium) {
		return (
			<Typography>
				Spotify Premium is required for Listen Along feature
			</Typography>
		);
	}

	return (
		<Button
			variant="contained"
			color="primary"
			onClick={handleTogglePlay}
			disabled={!currentSong}
		>
			{isPlaying ? "Stop Listening Along" : "Listen Along"}
		</Button>
	);
};

export default SpotifyPlayer;
