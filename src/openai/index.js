import axios from "axios";
import { system_prompts } from "./prompts.js";

const openAIApiKey = import.meta.VITE_OPENAI_API_KEY;

// Instancia de axios
const api = axios.create({
	baseURL: "https://api.openai.com/v1",
	timeout: 50000,
	headers: {
		Authorization: `Bearer ${openAIApiKey}`,
	},
});

const createSystemPrompt = (
	difficulty,
	turn,
	regenerate,
	lastGeneratedMovement
) => {
	if (regenerate) {
		return `${system_prompts[difficulty]} \n- Juegas como: ${turn}`;
	} else {
		return `${system_prompts[difficulty]} \n- Juegas como: ${turn}`;
	}
};

const createMovement = async (
	difficulty,
	history,
	turn,
	regenerate,
	lastGeneratedMovement
) => {
	try {
		const response = await api.post("/responses", {
			model: "o4-mini",
			input: regenerate
				? `Cometiste un error la última vez, el movimiento ${
						lastGeneratedMovement.movimiento
				  } que diste no es válido, ya que la pieza ${
						lastGeneratedMovement.pieza
				  } no puede ir ahí desde su posición actual. \n\n ${JSON.stringify(
						history
				  )}`
				: JSON.stringify(history), // User prompt
			instructions: `${system_prompts[difficulty]} \n- Juegas como: ${turn}`, // System prompt
		});

		// Checar si el movimiento es legal
		for (let element of response.data.output) {
			if (element.type === "message") {
				return JSON.parse(element.content[0].text);
			}
		}
	} catch (error) {
		// Error de la API
		console.error("Error creating movement:", error);
		return null;
		// Qué logica implementamos si falla la API?
	}
};

export { createMovement };
