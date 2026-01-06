import "./game.css";
import { useParams } from "react-router-dom";
import Board from "./components/board";
import { useState, useEffect } from "react";
import {
	movePieceOnTake,
	validateMovement,
	isKingOnCheck,
	getPieceMovements,
} from "./components/board/movements";
import { createMovement } from "../openai/index.js";
import EndgameModal from "./components/endgameModal";
import { testHistory, testPieces } from "../constants.js";

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

const getImage = (type, color) => {
	var imageString = "";
	switch (type) {
		case "queen":
			imageString = `q${color.charAt(0)}.png`;
			break;

		case "rook":
			imageString = `r${color.charAt(0)}.png`;
			break;

		case "bishop":
			imageString = `b${color.charAt(0)}.png`;
			break;

		case "knight":
			imageString = `n${color.charAt(0)}.png`;
			break;

		default:
			imageString = `p${color.charAt(0)}.png`;
			break;
	}

	return imageString;
};

const Game = () => {
	const { gameType, player1, player2, difficulty } = useParams();

	const [capturesTop, setCapturesTop] = useState([]);
	const [capturesBottom, setCapturesBottom] = useState([]);
	const [pieces, setPieces] = useState([]);
	const [lightKingOnCheck, setLightKingOnCheck] = useState(false);
	const [darkKingOnCheck, setDarkKingOnCheck] = useState(false);

	const [turn, setTurn] = useState("light");

	const [history, setHistory] = useState([]);

	const [checkmate, setCheckmate] = useState(false);
	const [stalemate, setStalemate] = useState(false);
	const [winner, setWinner] = useState("");

	const numbers = defineNumbers(gameType);

	const color = gameType.split("_")[1];

	const gameTypeName = gameType.split("_")[0];

	const darkOnTop = numbers[0] === "8";

	const saveGame = (
		pieces,
		newHistory,
		newCapturesBottom,
		newCapturesTop,
		lightKingOnCheck,
		darkKingOnCheck,
		tempCheckmate,
		tempStalemate,
		winner
	) => {
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
			lightKingOnCheck: lightKingOnCheck,
			darkKingOnCheck: darkKingOnCheck,
			checkmate: tempCheckmate,
			stalemate: tempStalemate,
			winner: winner,
		};

		localStorage.setItem(gameType, JSON.stringify(gameConfiguration));
	};

	const getLastMovement = () => {
		if (!history.length) {
			return "";
		}
		const lastTurn = history[history.length - 1];
		return lastTurn.dark ? lastTurn.dark : lastTurn.light;
	};

	const getNewHistory = (piece, movementString, actualHistory = null) => {
		var tempHistory = actualHistory ? [...actualHistory] : [...history];

		if (piece.color === "light") {
			tempHistory.push({ light: movementString });
		} else {
			tempHistory[tempHistory.length - 1].dark = movementString;
		}

		return tempHistory;
	};

	useEffect(() => {
		const actualConfiguration = JSON.parse(localStorage.getItem(gameType));

		if (
			actualConfiguration.gametype === "ai" &&
			actualConfiguration.isNew &&
			color === "black"
		) {
			// Empieza el juego la IA
			generateAIMovement([], actualConfiguration.pieces);
		}

		// Asignar todo a como está en la configuración guardada
		// setHistory(actualConfiguration.history);
		setHistory(testHistory);
		setCapturesTop(actualConfiguration.capturesTop);
		setCapturesBottom(actualConfiguration.capturesBottom);
		setTurn(actualConfiguration.turn);
		// setPieces(actualConfiguration.pieces);
		setPieces(testPieces);
		setLightKingOnCheck(actualConfiguration.lightKingOnCheck);
		setDarkKingOnCheck(actualConfiguration.darkKingOnCheck);
		setCheckmate(actualConfiguration.checkmate);
		setStalemate(actualConfiguration.stalemate);
		setWinner(actualConfiguration.winner);
	}, []);

	const generateAIMovement = async (newHistory, tempPieces) => {
		let isValid = false;
		let regenerate = false;
		let lastGeneratedMovement;

		// -------- REGISTRAR CAPTURES Y TAKES, JAQUES, JAQUEMATE, STALEMATE --------
		do {
			var newMovement = await createMovement(
				difficulty,
				newHistory,
				color === "white" ? "dark" : "light",
				regenerate,
				lastGeneratedMovement
			);

			var validation = validateMovement(
				tempPieces,
				newMovement.pieza,
				newMovement.movimiento,
				darkOnTop,
				getLastMovement()
			);

			isValid = validation.isValid;
			regenerate = true;
			lastGeneratedMovement = newMovement;
		} while (!isValid);

		const capturedPiece = tempPieces.find((p) => {
			return (
				p.position.x === validation.movement.x &&
				p.position.y === validation.movement.y
			);
		});

		var aiTempPieces = movePieceOnTake(
			tempPieces,
			validation.piece,
			validation.movement.x,
			validation.movement.y,
			validation.isTake
		);

		if (validation.conversionType) {
			let pieceType;

			switch (validation.conversionType) {
				case "Q":
					pieceType = "queen";
					break;
				case "R":
					pieceType = "rook";
					break;
				case "B":
					pieceType = "bishop";
					break;
				case "N":
					pieceType = "knight";
					break;
				default:
					pieceType = "queen";
					break;
			}

			const pieceToChange = aiTempPieces.find((p) => {
				return p.name === validation.piece.name;
			});

			const pieceToChangeIndex = aiTempPieces.indexOf(pieceToChange);

			var nameNum = 0;

			aiTempPieces.forEach((p) => {
				if (p.type === pieceType && p.color === validation.piece.color)
					nameNum++;
			});

			aiTempPieces[pieceToChangeIndex] = {
				...pieceToChange,
				name: `${validation.piece.color}${pieceType
					.charAt(0)
					.toUpperCase()}${pieceType.slice(1)}${nameNum + 1}`,
				type: pieceType,
				image: getImage(pieceType, validation.piece.color),
			};
		}

		var aiNewHistory = getNewHistory(
			validation.piece,
			newMovement.movimiento,
			newHistory
		);

		setHistory(aiNewHistory);

		if (validation.isTake) {
			var newCapturesTop = [...capturesTop, capturedPiece];

			setCapturesTop(newCapturesTop);
		}

		const tempKing = tempPieces.find((p) => {
			return p.type === "king" && p.color !== validation.piece.color;
		});

		var tempLightCheck = false;
		var tempDarkCheck = false;

		const kingOnCheck = !isKingOnCheck(
			tempPieces,
			tempKing.position,
			tempKing,
			darkOnTop
		);

		if (kingOnCheck) {
			if (tempKing.color === "light") {
				setLightKingOnCheck(true);
				tempLightCheck = true;
			} else {
				setDarkKingOnCheck(true);
				tempDarkCheck = true;
			}
		} else {
			setLightKingOnCheck(false);
			setDarkKingOnCheck(false);
			tempLightCheck = false;
			tempDarkCheck = false;
		}

		setPieces(aiTempPieces);
		setTurn(color === "white" ? "light" : "dark");

		const friendlyPieces = tempPieces.filter(
			(p) => p.color === tempKing.color
		);

		var noMovesLeft = true;

		for (let i = 0; i < friendlyPieces.length; i++) {
			var friendlyPiece = friendlyPieces[i];

			const friendlyPieceMovements = getPieceMovements(
				friendlyPiece,
				friendlyPiece.position.x,
				friendlyPiece.position.y,
				tempPieces,
				darkOnTop,
				true
			);

			if (friendlyPieceMovements.length) {
				noMovesLeft = false;
				break;
			}
		}

		var tempCheckmate = false;
		var tempStalemate = false;
		var tempWinner = "";

		if (noMovesLeft) {
			setTurn("");
			if (kingOnCheck) {
				setCheckmate(true);
				tempCheckmate = true;
				setWinner(tempKing.color === "light" ? "dark" : "light");
				tempWinner = tempKing.color === "light" ? "dark" : "light";
			} else {
				setStalemate(true);
				tempStalemate = true;
			}
		}

		saveGame(
			tempPieces,
			newHistory,
			capturesBottom,
			capturesTop,
			tempLightCheck,
			tempDarkCheck,
			tempCheckmate,
			tempStalemate,
			tempWinner
		);
	};

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
					lightKingOnCheck={lightKingOnCheck}
					setLightKingOnCheck={setLightKingOnCheck}
					darkKingOnCheck={darkKingOnCheck}
					setDarkKingOnCheck={setDarkKingOnCheck}
					gameTypeName={gameTypeName}
					color={color === "white" ? "light" : "dark"}
					difficulty={difficulty}
					getLastMovement={getLastMovement}
					getNewHistory={getNewHistory}
					generateAIMovement={generateAIMovement}
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
export { defineNumbers, getImage };
