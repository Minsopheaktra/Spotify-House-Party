import axios from "axios";
import { ACCESS_TOKEN } from "./constants";

const apiUrl = "https://d77bce3a-8be9-4143-938e-60c1962bbafe-dev.e1-us-east-azure.choreoapis.dev/spotifyhouseparty/backend/v1.0";

const api = axios.create({
	baseURL: import.meta.env.VITE_API_URL
		? import.meta.env.VITE_API_URL
		: apiUrl,
});

api.interceptors.request.use(
	(config) => {
		const token = localStorage.getItem(ACCESS_TOKEN);
		if (token) {
			config.headers.Authorization = `Bearer ${token}`;
		}
		return config;
	},
	(error) => {
		return Promise.reject(error);
	}
);

export default api;
