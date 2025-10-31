import axios from "axios";

// Instancia de axios
const api = axios.create({
	baseURL: "https://api.openai.com/v1",
	timeout: 50000,
	headers: {
		Authorization: `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
	},
});

const run = async () => {
	try {
		const response = await api.post("/responses", {
			model: "o4-mini",
			input: "Dame un chiste sobre ajedrez",
		});
		console.log("OpenAI response:", response.data);
	} catch (error) {
		console.error("Error fetching from OpenAI:", error);
	}
};

export { run };
