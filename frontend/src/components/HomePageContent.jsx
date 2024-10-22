import React from "react";
import { Grid, Button, ButtonGroup, Typography } from "@mui/material";
import { Link } from "react-router-dom";
import { authenticateSpotify, logoutFromSpotify } from '../spotifyApi';

const HomePageContent = ({isSpotifyAuthenticated, setIsSpotifyAuthenticated}) => {
	const handleSpotifyLogin = async () => {
        try {
            const authUrl = await authenticateSpotify();
            if (authUrl) {
                window.location.href = authUrl;
				// Optionally use this to open in a new tab: 
				// window.open(authUrl, '_blank', 'noopener,noreferrer');
            } else {
                // Optionally, update some state to reflect that the user is logged in
				setIsSpotifyAuthenticated(true);
            }
        } catch (error) {
            console.error("Failed to authenticate with Spotify:", error);
            // Optionally, show an error message to the user
        }
	};

	const handleSpotifyLogout = async () => {
		const logoutMessage = await logoutFromSpotify();
		console.log("Spotify logout message:", logoutMessage);
        window.location.reload();
		setIsSpotifyAuthenticated(false);
	};

	return (
		<Grid container spacing={3}>
			<Grid item xs={12} align="center">
				<Typography variant="h3" compact="h3">
					House Party
				</Typography>
			</Grid>
			<Grid item xs={12} align="center">
				<ButtonGroup
					disableElevation
					variant="contained"
					color="primary"
				>
					<Button color="primary" to="/join" component={Link}>
						Join a Room
					</Button>
					<Button color="secondary" to="/create" component={Link}>
						Create a Room
					</Button>
				</ButtonGroup>
			</Grid>
			<Grid item xs={12} align="center">
				<Button
					variant="contained"
					color="success"
					onClick={isSpotifyAuthenticated ? handleSpotifyLogout : handleSpotifyLogin}
				>
					{isSpotifyAuthenticated
						? "Disconnect from Spotify"
						: "Connect to Spotify"}
				</Button>
			</Grid>
		</Grid>
	);
}

export default HomePageContent;
