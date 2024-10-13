import api from "./api";

// Function to authenticate Spotify
export const authenticateSpotify = async () => {
	try {
		const { data } = await api.get("/spotify/is-authenticated");
		if (!data.status) {
			const authResponse = await api.get("/spotify/get-auth-url");
			window.location.replace(authResponse.data.url);
		}
		return data.status;
	} catch (error) {
		console.error("Error API authenticating Spotify:", error);
		throw error;
	}
};

// Function to get the current song
export const getCurrentSong = async () => {
	try {
		const response = await api.get("/spotify/current-song");
		return response.data;
	} catch (error) {
		console.error("Error API fetching current song:", error);
		throw error;
	}
};

// Function to pause the song
export const pauseSong = async () => {
	try {
		await api.put("/spotify/pause");
	} catch (error) {
		console.error("Error API pausing the song:", error);
		throw error; // Re-throw the error for handling in the component
	}
};

// Function to play the song
export const playSong = async () => {
	try {
		await api.put("/spotify/play");
	} catch (error) {
		console.error("Error API playing the song:", error);
		throw error; // Re-throw the error for handling in the component
	}
};

export default { authenticateSpotify, getCurrentSong, pauseSong, playSong };
