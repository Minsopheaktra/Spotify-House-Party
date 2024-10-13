import React, { useState } from "react";
import {
	Grid,
	Typography,
	Card,
	IconButton,
	LinearProgress,
} from "@mui/material";
import PauseIcon from "@mui/icons-material/Pause";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import SkipNextIcon from "@mui/icons-material/SkipNext";
import { pauseSong, playSong } from "../spotifyApi";

function MusicPlayer({
	title,
	artist,
	is_playing,
	image_url,
	time,
	duration,
	updateSongStatus,
}) {
	// Function to pause the song
	const handlePauseSong = async () => {
		try {
		await pauseSong();
		updateSongStatus(false); // Update the state to reflect paused status
		} catch (error) {
		console.error("Error while pausing the song:", error);
		}
	};

	// Function to play the song
	const handlePlaySong = async () => {
		try {
		await playSong();
		updateSongStatus(true); // Update the state to reflect playing status
		} catch (error) {
		console.error("Error while playing the song:", error);
		}
	};

	const songProgress = (time / duration) * 100;

	if (!title || !artist || !duration) {
		return (
			<Grid container alignItems="center" justifyContent="center">
				<Typography variant="h5" component="h5" align="center">
					Start Playing Some Song!!!
				</Typography>
			</Grid>
		);
	}

	return (
		<Card>
			<Grid container alignItems="center">
				<Grid item align="center" xs={4}>
					<img
						src={image_url}
						height="100%"
						width="100%"
						alt="Album cover"
					/>
				</Grid>
				<Grid item align="center" xs={8}>
					<Typography component="h5" variant="h5">
						{title}
					</Typography>
					<Typography color="textSecondary" variant="subtitle1">
						{artist}
					</Typography>
					<span>
						<IconButton
							onClick={() =>
								is_playing ? handlePauseSong() : handlePlaySong()
							}
						>
							{is_playing ? <PauseIcon /> : <PlayArrowIcon />}
						</IconButton>
						<IconButton>
							<SkipNextIcon />
						</IconButton>
					</span>
				</Grid>
			</Grid>
			<LinearProgress variant="determinate" value={songProgress} />
		</Card>
	);
}

export default MusicPlayer;


	// // Function to pause the song
	// const pauseSong = async () => {
	// 	const requestOptions = {
	// 		method: "PUT",
	// 		headers: { "Content-Type": "application/json" },
	// 	};
	// 	const response = await fetch(`${import.meta.env.VITE_API_URL}/spotify/pause`, requestOptions);
	// 	if (response.ok) {
	// 		updateSongStatus(false); // Update the state to reflect paused status
	// 	}
	// };

	// // Function to play the song
	// const playSong = async () => {
	// 	const requestOptions = {
	// 		method: "PUT",
	// 		headers: { "Content-Type": "application/json" },
	// 	};
	// 	const response = await fetch(`${import.meta.env.VITE_API_URL}/spotify/play`, requestOptions);
	// 	if (response.ok) {
	// 		updateSongStatus(true); // Update the state to reflect playing status
	// 	}
	// };