import React, { useState } from "react";
import { Grid, Button, TextField, Typography } from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import { joinRoom } from "../roomApi";

// Fuction based Component //
function RoomJoinPage(props) {
	// states
	const [roomCode, setRoomCode] = useState("");
	const [error, setError] = useState("");

	const navigate = useNavigate();

	function handleTextFieldChange(e) {
		setRoomCode(e.target.value);
		setError("");
	}

	async function roomButtonPressed() {
		try {
		  const response = await joinRoom(roomCode);
		  if (response.status === 200) {
			navigate("/room/" + roomCode); // Navigate only if the room exists
		  }
		} catch (error) {
		  console.log("There was a problem joining the room:", error);
		  setError("Room not found or another error occurred. Please try again."); // Set a general error message
		}
	  }

	return (
		<Grid container spacing={1}>
			<Grid item xs={12} align="center">
				<Typography variant="h4" component="h4">
					Join a Room
				</Typography>
			</Grid>
			<Grid item xs={12} align="center">
				<TextField
					error={!!error} // Convert the error string to a boolean
					label="code"
					placeholder="Enter a Room Code"
					value={roomCode}
					helperText={error || ""} // Show the error message if it exists
					variant="outlined"
					onChange={handleTextFieldChange}
				/>
			</Grid>
			<Grid item xs={12} align="center">
				<Button
					variant="contained"
					color="primary"
					onClick={roomButtonPressed}
				>
					Enter Room
				</Button>
			</Grid>
			<Grid item xs={12} align="center">
				<Button
					variant="contained"
					color="secondary"
					to="/"
					component={Link}
				>
					Back
				</Button>
			</Grid>
		</Grid>
	);
}

export default RoomJoinPage;


	// async function roomButtonPressed() {
	// 	const requestOptions = {
	// 		method: "POST",
	// 		headers: { "Content-Type": "application/json" },
	// 		body: JSON.stringify({
	// 			code: roomCode,
	// 		}),
	// 	};
	// 	try {
	// 		const response = await fetch(`${import.meta.env.VITE_API_URL}/api/join-room`, requestOptions);
	// 		if (!response.ok) {
	// 			setError("Room not found."); // Set error message
	// 			return; // Exit early if room not found
	// 		}
	// 		navigate("/room/" + roomCode); // Navigate only if the room exists
	// 	} catch (error) {
	// 		console.log("There was a problem with the fetch operation:", error);
	// 		setError("An error occurred. Please try again."); // Set a general error message
	// 	}
	// }