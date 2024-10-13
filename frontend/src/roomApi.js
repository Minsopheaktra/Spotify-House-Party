import api from "./api";

// Function to get room details
export const getRoomDetails = async (roomCode) => {
	try {
		const response = await api.get(`/room-api/get-room?code=${roomCode}`);
		return response.data;
	} catch (error) {
		console.error("Error fetching room details:", error);
		throw error;
	}
};

// Create room API call
export const createRoom = async (roomData) => {
	try {
		const response = await api.post("/room-api/create-room/", roomData);
		return response.data; // Return the data part of the response
	} catch (error) {
		console.error("Error API creating room:", error);
		throw error; // Re-throw the error for handling in the component
	}
};

// Update room API call
export const updateRoom = async (roomData) => {
	try {
		const response = await api.patch("/room-api/update-room/", roomData);
		return response; // Return the full Axios response if needed
	} catch (error) {
		console.error("Error API updating room:", error);
		throw error; // Re-throw the error for handling in the component
	}
};

// Function to check if user is in a room
export const getUserInRoom = async () => {
	try {
		const response = await api.get("/room-api/user-in-room/");
		return response.data; // Return the data part of the response
	} catch (error) {
		console.error("Error API checking user in room:", error);
		throw error; // Re-throw the error for handling in the component
	}
};

// Join room API call
export const joinRoom = async (roomCode) => {
	try {
		const response = await api.post("/room-api/join-room/", {
			code: roomCode,
		});
		return response; // Return the full Axios response if needed
	} catch (error) {
		console.error("Error API joining the room:", error);
		throw error; // Re-throw the error for handling in the component
	}
};

// Function to leave the room
export const leaveRoom = async () => {
	try {
		const response = await api.post("/room-api/leave-room/");
		return response.data;
	} catch (error) {
		console.error("Error API leaving room:", error);
		throw error;
	}
};

export default {
	getRoomDetails,
	createRoom,
	updateRoom,
	getUserInRoom,
	leaveRoom,
	joinRoom,
};
