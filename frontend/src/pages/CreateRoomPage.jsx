import React, { useState } from "react";
import {
	Grid,
	Button,
	TextField,
	FormHelperText,
	FormControl,
	Typography,
	Radio,
	RadioGroup,
	FormControlLabel,
	Collapse,
	Alert,
} from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import { createRoom, updateRoom } from "../roomApi";

function CreateRoomPage({
	votesToSkip: defaultVotesToSkip = 2,
	guestCanPause: defaultGuestCanPause = true,
	update = false,
	roomCode = null,
	updateCallback = () => {},
}) {
	const navigate = useNavigate();

	const [guestCanPause, setGuestCanPause] = useState(defaultGuestCanPause);
	const [votesToSkip, setVotesToSkip] = useState(defaultVotesToSkip);
	const [errorMsg, setErrorMsg] = useState("");
	const [successMsg, setSuccessMsg] = useState("");

	function handleVotesChange(e) {
		setVotesToSkip(Number(e.target.value));
	}

	function handleGuestCanPauseChange(e) {
		setGuestCanPause(e.target.value === "true" ? true : false);
	}

	async function handleCreateRoom() {
		try {
			const roomData = {
				votes_to_skip: votesToSkip,
				guest_can_pause: guestCanPause,
			};
			const data = await createRoom(roomData); // Call the createRoom function
			navigate(`/room/${data.code}`); // Use the room code returned from the API
		} catch (error) {
			console.error("Error Function handle creating room:", error);
		}
	}


	// For updating a room
	async function handleUpdateRoom() {
		try {
			const roomData = {
				votes_to_skip: votesToSkip,
				guest_can_pause: guestCanPause,
				code: roomCode,
			};
			await updateRoom(roomData); // Call the updateRoom function
			setSuccessMsg("Room Updated Successfully!");
		} catch (error) {
			console.error("Error Function updating room:", error);
			setErrorMsg("Error Function Updating Room: " + error.message);
		}
	}

	function renderCreateButtons() {
		return (
			<Grid container spacing={1}>
				<Grid item xs={12} align="center">
					<Button
						color="primary"
						variant="contained"
						onClick={handleCreateRoom}
					>
						Create A Room
					</Button>
				</Grid>
				<Grid item xs={12} align="center">
					<Button
						color="secondary"
						variant="contained"
						to="/"
						component={Link}
					>
						Back
					</Button>
				</Grid>
			</Grid>
		);
	}

	function renderUpdateButtons() {
		return (
			<Grid container spacing={1}>
				<Grid item xs={12} align="center">
					<Button
						color="primary"
						variant="contained"
						onClick={handleUpdateRoom}
					>
						Update Room
					</Button>
				</Grid>
			</Grid>
		);
	}

	const title = update ? "Update Room" : "Create Room";

	return (
		<Grid container spacing={1}>
			<Grid item xs={12} align="center">
				<Collapse in={errorMsg !== "" || successMsg !== ""}>
					{successMsg !== "" ? (
						<Alert
							severity="success"
							onClose={() => {
								setSuccessMsg("");
							}}
						>
							{successMsg}
						</Alert>
					) : (
						<Alert
							severity="error"
							onClose={() => {
								setErrorMsg("");
							}}
						>
							{errorMsg}
						</Alert>
					)}
				</Collapse>
			</Grid>
			<Grid item xs={12} align="center">
				<Typography component="h4" variant="h4">
					{title}
				</Typography>
			</Grid>
			<Grid item xs={12} align="center">
				<FormControl component="fieldset">
					<FormHelperText>
						<span align="center">
							Guest Control of Playback State
						</span>
					</FormHelperText>
					<RadioGroup
						row
						value={guestCanPause.toString()}
						onChange={handleGuestCanPauseChange}
					>
						<FormControlLabel
							value="true"
							control={<Radio color="primary" />}
							label="Play/Pause"
							labelPlacement="bottom"
						/>
						<FormControlLabel
							value="false"
							control={<Radio color="secondary" />}
							label="No Control"
							labelPlacement="bottom"
						/>
					</RadioGroup>
				</FormControl>
			</Grid>
			<Grid item xs={12} align="center">
				<FormControl>
					<TextField
						required={true}
						type="number"
						onChange={handleVotesChange}
						defaultValue={votesToSkip}
						inputProps={{
							min: 1,
							style: { textAlign: "center" },
						}}
					/>
					<FormHelperText>
						<span align="center">Votes Required To Skip Song</span>
					</FormHelperText>
				</FormControl>
			</Grid>
			{update ? renderUpdateButtons() : renderCreateButtons()}
		</Grid>
	);
}

export default CreateRoomPage;


	// async function handleRoomButtonPressed() {
	// 	const requestOptions = {
	// 		method: "POST",
	// 		headers: { "Content-Type": "application/json" },
	// 		body: JSON.stringify({
	// 			votes_to_skip: votesToSkip,
	// 			guest_can_pause: guestCanPause,
	// 		}),
	// 	};
	// 	try {
	// 		const response = await fetch(`${import.meta.env.VITE_API_URL}/api/create-room`, requestOptions);
	// 		if (!response.ok) {
	// 			throw new Error("Network response was not ok");
	// 		}
	// 		const data = await response.json();
	// 		navigate("/room/" + data.code);
	// 	} catch (error) {
	// 		console.error(
	// 			"There was a problem with the fetch operation:",
	// 			error.message
	// 		);
	// 		setErrorMsg("Error creating room: " + error.message);
	// 	}
	// }

		// async function handleUpdateButtonPressed() {
	// 	const requestOptions = {
	// 		method: "PATCH",
	// 		headers: { "Content-Type": "application/json" },
	// 		body: JSON.stringify({
	// 			votes_to_skip: votesToSkip,
	// 			guest_can_pause: guestCanPause,
	// 			code: roomCode,
	// 		}),
	// 	};
	// 	try {
	// 		const response = await fetch(`${import.meta.env.VITE_API_URL}/api/update-room`, requestOptions);
	// 		if (response.ok) {
	// 			setSuccessMsg("Room Updated Successfully!");
	// 			updateCallback();
	// 		} else {
	// 			setErrorMsg("Error Updating Room...");
	// 		}
	// 		updateCallback();
	// 	} catch (error) {
	// 		setErrorMsg("Error Updating Room: " + error.message);
	// 	}
	// }