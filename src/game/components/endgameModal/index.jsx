import React from "react";
import { useNavigate } from "react-router-dom";
import "./endgameModal.css";

const EndgameModal = ({ checkmate, winner, numbers, player1, player2 }) => {
	const navigate = useNavigate();

	const darkOnTop = numbers[0] === "8";
	const winnerPlayer = darkOnTop
		? winner === "dark"
			? player2
			: player1
		: winner === "dark"
		? player1
		: player2;
	return (
		<div className="modal">
			<h2>{checkmate ? "Jaque mate!!!" : "Empate!!!!"}</h2>
			<p>
				{checkmate
					? `El jugador ${winnerPlayer} ha ganado la partida!`
					: "Los jugadores han empatado"}
			</p>
			<button onClick={() => {}}>Regresar a menú</button>
		</div>
	);
};

export default EndgameModal;
