import api from "./api";

// Function to authenticate Spotify
export const authenticateSpotify = async () => {
	try {
		const { data } = await api.get("/spotify/is-spotify-authenticated");
		if (!data.status) {
			const authResponse = await api.get("/spotify/get-auth-url");
			return authResponse.data.url;
		}
		return null; // Already authenticated
	} catch (error) {
		console.error("Error authenticating Spotify:", error);
		throw error;
	}
};

export const getSpotifyAccessToken = async () => {
	try {
		const response = await api.get("/spotify/get-token");
		return response.data.access_token;
	} catch (error) {
		console.error("Error API fetching Spotify access token:", error);
		throw error;
	}
};

// Function to logout from Spotify
export const logoutFromSpotify = async () => {
	localStorage.removeItem("spotifyToken");
	localStorage.removeItem("spotifyRefreshToken");
	try {
		const response = await api.post("/spotify/spotify-logout");
		return response.data.message;
	} catch (error) {
		console.error("Error logging out from Spotify:", error);
		throw error;
	}
};

// Function to get the Spotify user profile
export const getSpotifyUserProfile = async () => {
	try {
		const response = await api.get("/spotify/spotify-user-profile");
		return response.data;
	} catch (error) {
		console.error("Error fetching Spotify user profile:", error);
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

export const checkSpotifyAuth = async () => {
	try {
		const { data } = await api.get("/spotify/is-spotify-authenticated");
		return data.status;
	} catch (error) {
		console.error("Error checking Spotify authentication:", error);
		return false;
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

export const playSongAlong = async (uri, positionMs) => {
	try {
		await api.put("/spotify/play-along", { uri, position_ms: positionMs });
	} catch (error) {
		console.error("Error playing song along:", error);
	}
};

export const pauseSongAlong = async () => {
	try {
		await api.put("/spotify/pause-along");
	} catch (error) {
		console.error("Error pausing song along:", error);
	}
};

export const checkSpotifyPremium = async () => {
	try {
		const response = await api.get("/spotify/check-premium");
		return response.data.isPremium;
	} catch (error) {
		console.error("Error checking Spotify Premium status:", error);
		return false;
	}
};

export default {
	authenticateSpotify,
	getCurrentSong,
	pauseSong,
	playSong,
	pauseSongAlong,
	playSongAlong,
	checkSpotifyPremium,
};
