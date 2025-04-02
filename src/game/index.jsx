import "./game.css";
import { useParams } from "react-router-dom";
import Board from "./components/board";

// Definimos orientación de tablero
const defineNumbers = (gameType) => {
	const gameTypeArray = gameType.split("_");
	console.log(gameTypeArray);

	if (gameTypeArray[0] === "ai") {
		if (gameTypeArray[1] === "white") {
			return ["8", "7", "6", "5", "4", "3", "2", "1"];
		}
		return ["1", "2", "3", "4", "5", "6", "7", "8"];
	}
	return ["8", "7", "6", "5", "4", "3", "2", "1"];
};

const Game = () => {
	const { gameType, player1, player2, difficulty } = useParams();
	const numbers = defineNumbers(gameType);

	const color = gameType.split("_")[1];

	return (
		<div className="game">
			<div className="top">
				<h2>
					{gameType === "two-players"
						? player2
						: color === "white"
						? player2
						: player1}
				</h2>
				<div className="captures"></div>
			</div>
			<div className="details">
				<Board numbers={numbers} />
				<div className="history">
					<div>Texto</div>
				</div>
			</div>
			<div className="bottom">
				<div className="player-info">
					<h2>
						{gameType === "two-players"
							? player1
							: color === "white"
							? player1
							: player2}
					</h2>
					<div className="captures">Capturas</div>
				</div>

				<div className="buttons-game">
					<button>Menu</button>
				</div>
			</div>
		</div>
	);
};

export default Game;
