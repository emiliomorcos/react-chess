import "./game.css";
import { useParams } from "react-router-dom";
import Board from "./components/board";
import { useState, useEffect } from "react";
import { defineInitialPositions } from "../constants";
import EndgameModal from "./components/endgameModal";

// Types para mostrar capturas
let types = ["pawn", "knight", "bishop", "rook", "queen", "king"];

// Definimos orientación de tablero
const defineNumbers = (gameType) => {
	const gameTypeArray = gameType.split("_");

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

	const [capturesTop, setCapturesTop] = useState([]);
	const [capturesBottom, setCapturesBottom] = useState([]);
	const [pieces, setPieces] = useState(
		defineInitialPositions(defineNumbers(gameType))
	);

	const [turn, setTurn] = useState("light");

	const [history, setHistory] = useState([]);

	const [checkmate, setCheckmate] = useState(false);
	const [stalemate, setStalemate] = useState(false);
	const [winner, setWinner] = useState("");

	const numbers = defineNumbers(gameType);

	const color = gameType.split("_")[1];

	const darkOnTop = numbers[0] === "8";

	const saveGame = (
		pieces,
		newHistory,
		newCapturesBottom,
		newCapturesTop
	) => {
		console.log("Guardando partida...");
		// Aquí se guardaria el estado del juego en localStorage

		// Keys: "ai_<color>", "two-players-<color>"

		const gameConfiguration = {
			pieces: pieces,
			history: newHistory,
			player1: player1,
			player2: player2,
			capturesTop: newCapturesTop,
			capturesBottom: newCapturesBottom,
			gametype: gameType,
			difficulty: difficulty,
			turn: turn === "light" ? "dark" : "light",
			isNew: false,
		};

		localStorage.setItem(gameType, JSON.stringify(gameConfiguration));
	};

	useEffect(() => {
		const actualConfiguration = JSON.parse(localStorage.getItem(gameType));

		console.log("Cargando partida...", actualConfiguration);
		// Asignar todo a como está en la configuración guardada
		setHistory(actualConfiguration.history);
		setCapturesTop(actualConfiguration.capturesTop);
		setCapturesBottom(actualConfiguration.capturesBottom);
		setTurn(actualConfiguration.turn);
		setPieces(actualConfiguration.pieces);

		// Reinicio TEMPORAL
		// setHistory([]);
		// setCapturesTop([]);
		// setCapturesBottom([]);
		// setTurn("light");
		// setPieces(defineInitialPositions(defineNumbers(gameType)));
	}, []);

	return (
		<div className="game">
			<div className="top">
				<h2
					className={
						darkOnTop
							? turn === "dark"
								? "turn"
								: ""
							: turn === "light"
							? "turn"
							: ""
					}
				>
					{gameType === "two-players"
						? player2
						: color === "white"
						? player2
						: player1}
				</h2>
				<div className="captures">
					{types.map((type) => {
						const tempTypeList = capturesTop.filter((capture) => {
							return capture.type === type;
						});

						var extraWidth = 0;
						if (tempTypeList.length > 1) {
							extraWidth += 10 * (tempTypeList.length - 1);
						}

						return (
							<div
								key={type}
								id={`topCaptured${type}`}
								style={{
									width: tempTypeList.length
										? `calc(5vh + ${extraWidth}px)`
										: undefined,
								}}
							>
								{tempTypeList.map((piece, idx) => {
									return (
										<img
											style={{
												position: "absolute",
												bottom: 2,
												left: 10 * idx,
											}}
											key={piece.name}
											src={`/${piece.image}`}
											alt={piece.name}
										></img>
									);
								})}
							</div>
						);
					})}
				</div>
			</div>
			<div className="details">
				<Board
					pieces={pieces}
					setPieces={setPieces}
					numbers={numbers}
					capturesTop={capturesTop}
					setCapturesTop={setCapturesTop}
					capturesBottom={capturesBottom}
					setCapturesBottom={setCapturesBottom}
					checkmate={checkmate}
					setCheckmate={setCheckmate}
					stalemate={stalemate}
					setStalemate={setStalemate}
					winner={winner}
					setWinner={setWinner}
					turn={turn}
					setTurn={setTurn}
					history={history}
					setHistory={setHistory}
					saveGame={saveGame}
				/>
				<div className="history">
					<div>
						<h2>Historial</h2>
						{history.map((turn, idx) => {
							return (
								<div
									className={`row ${
										idx % 2 === 0 ? "black" : "gray"
									}`}
								>
									<div>{idx + 1}.</div>
									<div>{turn.light}</div>
									<div>{turn.dark}</div>
								</div>
							);
						})}
					</div>
					{(checkmate || stalemate) && (
						<EndgameModal
							checkmate={checkmate}
							winner={winner}
							numbers={numbers}
							player1={player1}
							player2={player2}
						/>
					)}
				</div>
			</div>
			<div className="bottom">
				<div className="player-info">
					<h2
						className={
							darkOnTop
								? turn === "dark"
									? ""
									: "turn"
								: turn === "light"
								? ""
								: "turn"
						}
					>
						{gameType === "two-players"
							? player1
							: color === "white"
							? player1
							: player2}
					</h2>
					<div className="captures">
						{types.map((type) => {
							const tempTypeList = capturesBottom.filter(
								(capture) => {
									return capture.type === type;
								}
							);

							var extraWidth = 0;
							if (tempTypeList.length > 1) {
								extraWidth += 10 * (tempTypeList.length - 1);
							}

							return (
								<div
									key={type}
									id={`bottomCaptured${type}`}
									style={{
										width: tempTypeList.length
											? `calc(5vh + ${extraWidth}px)`
											: undefined,
									}}
								>
									{tempTypeList.map((piece, idx) => {
										return (
											<img
												style={{
													position: "absolute",
													bottom: 2,
													left: 10 * idx,
												}}
												key={piece.name}
												src={`/${piece.image}`}
												alt={piece.name}
											></img>
										);
									})}
								</div>
							);
						})}
					</div>
				</div>

				<div className="buttons-game">
					<button>Menu</button>
				</div>
			</div>
		</div>
	);
};

export default Game;
