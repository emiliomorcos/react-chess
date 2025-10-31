import "./board.css";
import { useEffect, useState } from "react";
import {
	getPawnMovements,
	getKnightMovements,
	getKingMovements,
	getRookMovements,
	getBishopMovements,
	getQueenMovements,
	movePieceOnTake,
	isKingOnCheck,
	getPieceMovements,
	getMovementsInCommon,
	getMovementString,
} from "./movements";
import PawnModal from "../pawnModal";

// Generamos tablero
const Board = ({
	pieces,
	setPieces,
	numbers,
	capturesTop,
	setCapturesTop,
	capturesBottom,
	setCapturesBottom,
	checkmate,
	setCheckmate,
	stalemate,
	setStalemate,
	winner,
	setWinner,
	turn,
	setTurn,
	history,
	setHistory,
	saveGame,
	lightKingOnCheck,
	setLightKingOnCheck,
	darkKingOnCheck,
	setDarkKingOnCheck,
}) => {
	const darkOnTop = numbers[0] === "8";

	// Definimos letras de columnas
	const letters = darkOnTop
		? ["a", "b", "c", "d", "e", "f", "g", "h"]
		: ["h", "g", "f", "e", "d", "c", "b", "a"];

	const [openPawnModal, setOpenPawnModal] = useState({
		open: false,
		coords: {},
		type: "",
	});
	const [possiblePieceMovements, setPossiblePieceMovements] = useState([]);
	const [selectedPiece, setSelectedPiece] = useState(null);

	const [lastCoordinates, setLastCoordinates] = useState({});

	useEffect(() => {
		if (selectedPiece) {
			var x = selectedPiece.position.x;
			var y = selectedPiece.position.y;
			setLastCoordinates({ x, y });
		}
	}, [selectedPiece]);

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

	const convertPawn = (pieceType) => {
		var tempPieces;
		console.log("convertPawn to", pieceType);
		if (openPawnModal.type === "move") {
			tempPieces = movePieceOnTake(
				[...pieces],
				selectedPiece,
				openPawnModal.coords.x,
				openPawnModal.coords.y
			);
		} else {
			const piece = pieces.find((p) => {
				return (
					p.position.x === openPawnModal.coords.x &&
					p.position.y === openPawnModal.coords.y
				);
			});
			tempPieces = [...pieces];
			const tempPieceIndex = tempPieces.indexOf(piece);
			tempPieces.splice(tempPieceIndex, 1);
			tempPieces = movePieceOnTake(
				tempPieces,
				selectedPiece,
				openPawnModal.coords.x,
				openPawnModal.coords.y
			);

			if (darkOnTop) {
				piece.color === "dark"
					? setCapturesBottom([...capturesBottom, piece])
					: setCapturesTop([...capturesTop, piece]);
			} else {
				piece.color === "dark"
					? setCapturesTop([...capturesTop, piece])
					: setCapturesBottom([...capturesBottom, piece]);
			}
		}

		// Cambiamos el peon a la otra pieza
		const pieceToChange = tempPieces.find((p) => {
			return p.name === selectedPiece.name;
		});

		const pieceToChangeIndex = tempPieces.indexOf(pieceToChange);

		// Manera manual de asignar
		// tempPieces[pieceToChangeIndex].name = "..."
		// tempPieces[pieceToChangeIndex].type = "..."
		// tempPieces[pieceToChangeIndex].image = "/..."

		var nameNum = 0;

		pieces.forEach((p) => {
			if (p.type === pieceType && p.color === selectedPiece.color)
				nameNum++;
		});

		tempPieces[pieceToChangeIndex] = {
			...pieceToChange,
			name: `${selectedPiece.color}${pieceType
				.charAt(0)
				.toUpperCase()}${pieceType.slice(1)}${nameNum + 1}`,
			type: pieceType,
			image: getImage(pieceType, selectedPiece.color),
		};

		setPieces(tempPieces);
		setPossiblePieceMovements([]);
		const tempKing = pieces.find((p) => {
			return p.type === "king" && p.color !== selectedPiece.color;
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
				console.log("light king on check true");
				tempLightCheck = true;
			} else {
				setDarkKingOnCheck(true);
				console.log("dark king on check true");
				tempDarkCheck = true;
			}
		} else {
			setLightKingOnCheck(false);
			setDarkKingOnCheck(false);
			tempLightCheck = false;
			tempDarkCheck = false;
		}

		const movementString = getMovementString(
			selectedPiece,
			pieces,
			openPawnModal.coords.x,
			openPawnModal.coords.y,
			openPawnModal.type === "take",
			kingOnCheck,
			false,
			lastCoordinates,
			darkOnTop,
			pieceType
		);

		const newHistory = getNewHistory(selectedPiece, movementString);
		setHistory(newHistory);

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
				true,
				getLastMovement()
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
			if (kingOnCheck) {
				setCheckmate(true);
				tempCheckmate = true;
				setWinner(tempKing.color === "light" ? "dark" : "light");
				tempWinner = tempKing.color === "light" ? "dark" : "light";
			} else {
				setStalemate(true);
				tempStalemate = true;
			}
			setTurn("");
		}

		setSelectedPiece(null);
		if (turn === "light") {
			setTurn("dark");
		} else {
			setTurn("light");
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
		setOpenPawnModal({ open: false, coords: {}, type: "" });
	};

	// Use Effect de chequeo si hay historial

	const getNewHistory = (piece, movementString) => {
		var tempHistory = [...history];
		if (piece.color === "light") {
			tempHistory.push({ light: movementString });
		} else {
			tempHistory[tempHistory.length - 1].dark = movementString;
		}

		return tempHistory;
	};

	const getLastMovement = () => {
		if (!history.length) {
			return "";
		}
		const lastTurn = history[history.length - 1];
		return lastTurn.dark ? lastTurn.dark : lastTurn.light;
	};

	// Definimos colores de cuadros con base en matriz y determinamos si hay una pieza en un square
	const getSquareClassname = (x, y, hasPiece) => {
		let classname = "square";
		classname += (x + y) % 2 === 0 ? " square-light" : " square-dark";
		classname += hasPiece ? " has-piece" : "";
		const isPossibleMovement = possiblePieceMovements.some((movement) => {
			return movement.x === x && movement.y === y;
		});

		classname += isPossibleMovement ? " possible-movement" : "";
		classname +=
			selectedPiece &&
			selectedPiece.position.x === x &&
			selectedPiece.position.y === y
				? " selected-piece"
				: "";

		if (lightKingOnCheck || darkKingOnCheck) {
			const lightKing = pieces.find((p) => {
				return p.type === "king" && p.color === "light";
			});
			const darkKing = pieces.find((p) => {
				return p.type === "king" && p.color === "dark";
			});

			classname +=
				lightKingOnCheck &&
				lightKing.position.x === x &&
				lightKing.position.y === y
					? " king-on-check"
					: "";

			classname +=
				darkKingOnCheck &&
				darkKing.position.x === x &&
				darkKing.position.y === y
					? " king-on-check"
					: "";
		}

		return classname;
	};

	// Definimos función para manejar el click de una pieza
	const handlePieceClick = (
		x,
		y,
		hasPiece,
		isPossibleMovement,
		isPossibleTake,
		isCastle
	) => {
		if (checkmate || stalemate) {
			return;
		}

		setOpenPawnModal({ open: false, coords: {}, type: "" });

		if (!hasPiece) {
			// -------------------- POSSIBLE MOVEMENT --------------------
			if (isPossibleMovement) {
				var pieceCommonMovements = [];

				// Conversión de peones
				if (selectedPiece.type === "pawn" && (y === 0 || y === 7)) {
					setOpenPawnModal({
						open: true,
						coords: { x, y },
						type: "move",
					});
					return;
				}

				if (
					selectedPiece.type === "knight" ||
					selectedPiece.type === "rook"
				) {
					const commonPiece = pieces.find((p) => {
						return (
							p.type === selectedPiece.type &&
							p.color === selectedPiece.color &&
							p.name !== selectedPiece.name
						);
					});
					if (commonPiece) {
						pieceCommonMovements = getMovementsInCommon(
							possiblePieceMovements,
							commonPiece,
							pieces,
							darkOnTop,
							true
						);
					}
				}

				var isCommon = false;

				if (
					pieceCommonMovements.some((movement) => {
						return movement.x === x && movement.y === y;
					})
				) {
					isCommon = true;
				}

				var tempPieces = movePieceOnTake(
					[...pieces],
					selectedPiece,
					x,
					y
				);

				// ----------- ENROQUE -----------
				// Revisar si se mueve a la derecha son 3 y a la izquierda son 2
				var castleDirection;

				if (isCastle) {
					// ENROQUE A LA DERECHA (corto)
					if (lastCoordinates.x < x) {
						const rookToMove = pieces.find((p) => {
							return (
								p.color === selectedPiece.color &&
								p.type === "rook" &&
								p.position.x === 7 &&
								p.position.y === selectedPiece.position.y
							);
						});
						tempPieces = movePieceOnTake(
							[...pieces],
							rookToMove,
							5,
							rookToMove.position.y
						);
						castleDirection = "short";

						// ENROQUE A LA IZQUIERDA (corto)
					} else {
						const rookToMove = pieces.find((p) => {
							return (
								p.color === selectedPiece.color &&
								p.type === "rook" &&
								p.position.x === 0 &&
								p.position.y === selectedPiece.position.y
							);
						});
						tempPieces = movePieceOnTake(
							[...pieces],
							rookToMove,
							3,
							rookToMove.position.y
						);
						castleDirection = "long";
					}
				}

				// ----------- EN PASSANT -----------
				if (isPossibleTake) {
					var removedPiece = {};
					// Si la pieza va hacia arriba
					if (
						(darkOnTop && selectedPiece.color === "light") ||
						(!darkOnTop && selectedPiece.color === "dark")
					) {
						removedPiece = pieces.find((p) => {
							return p.position.x === x && p.position.y === y + 1;
						});
					}
					// Si la pieza va hacia abajo
					if (
						(!darkOnTop && selectedPiece.color === "light") ||
						(darkOnTop && selectedPiece.color === "dark")
					) {
						removedPiece = pieces.find((p) => {
							return p.position.x === x && p.position.y === y - 1;
						});
					}

					const tempPieceIndex = tempPieces.indexOf(removedPiece);
					tempPieces.splice(tempPieceIndex, 1);
				}
				setPieces(tempPieces);
				setPossiblePieceMovements([]);

				// Revisar si el rey opuesto está en jaque
				const tempKing = pieces.find((p) => {
					return p.type === "king" && p.color !== selectedPiece.color;
				});

				var tempLightCheck = false;
				var tempDarkCheck = false;

				const kingOnCheck = !isKingOnCheck(
					pieces,
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

				// Revisar si hay jaque mate o stalemate
				//Checar si hay algun movimimento posible para piezas del color del rey

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
						true,
						getLastMovement()
					);

					if (friendlyPieceMovements.length) {
						noMovesLeft = false;
						break;
					}
				}

				var movementString;

				if (isCastle) {
					movementString =
						castleDirection === "short" ? "O-O" : "O-O-O";
				} else {
					movementString = getMovementString(
						selectedPiece,
						pieces,
						x,
						y,
						isPossibleTake,
						kingOnCheck,
						isCommon,
						lastCoordinates,
						darkOnTop
					);
				}

				// Si se movió uno blanco -> creamos objeto en el arreglo history
				// Si se movió uno negro -> lo agregamos al ultimo arreglo history
				const newHistory = getNewHistory(selectedPiece, movementString);
				setHistory(newHistory);

				var tempCheckmate = false;
				var tempStalemate = false;
				var tempWinner = "";

				if (noMovesLeft) {
					if (kingOnCheck) {
						setCheckmate(true);
						tempCheckmate = true;
						setWinner(
							tempKing.color === "light" ? "dark" : "light"
						);
						tempWinner =
							tempKing.color === "light" ? "dark" : "light";
					} else {
						setStalemate(true);
						tempStalemate = true;
					}
					setTurn("");
				}

				setSelectedPiece(null);
				if (turn === "light") {
					setTurn("dark");
				} else {
					setTurn("light");
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
			}
			return;
		}

		const piece = pieces.find((p) => {
			return p.position.x === x && p.position.y === y;
		});

		// -------------------- POSSIBLE TAKE --------------------
		//  Checar si el square con pieza es un possible movement && isTake === true
		if (isPossibleTake) {
			var pieceCommonMovements = [];

			// Conversion de peones
			if (selectedPiece.type === "pawn" && (y === 0 || y === 7)) {
				setOpenPawnModal({
					open: true,
					coords: { x, y },
					type: "take",
				});
				return;
			}

			if (
				selectedPiece.type === "knight" ||
				selectedPiece.type === "rook"
			) {
				const commonPiece = pieces.find((p) => {
					return (
						p.type === selectedPiece.type &&
						p.color === selectedPiece.color &&
						p.name !== selectedPiece.name
					);
				});
				if (commonPiece) {
					pieceCommonMovements = getMovementsInCommon(
						possiblePieceMovements,
						commonPiece,
						pieces,
						darkOnTop,
						true
					);
				}
			}

			var isCommon = false;

			if (
				pieceCommonMovements.some((movement) => {
					return movement.x === x && movement.y === y;
				})
			) {
				isCommon = true;
			}
			// Agregamos como captura la pieza clickeada
			if (darkOnTop) {
				piece.color === "dark"
					? setCapturesBottom([...capturesBottom, piece])
					: setCapturesTop([...capturesTop, piece]);
			} else {
				piece.color === "dark"
					? setCapturesTop([...capturesTop, piece])
					: setCapturesBottom([...capturesBottom, piece]);
			}

			var tempPieces = [...pieces];

			const tempPieceIndex = tempPieces.indexOf(piece);
			tempPieces.splice(tempPieceIndex, 1);
			tempPieces = movePieceOnTake(tempPieces, selectedPiece, x, y);

			setPieces(tempPieces);
			setPossiblePieceMovements([]);

			// Revisar si el rey opuesto está en jaque
			const tempKing = pieces.find((p) => {
				return p.type === "king" && p.color !== selectedPiece.color;
			});

			const kingOnCheck = !isKingOnCheck(
				pieces,
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

			//Revisar si hay jaque mate o stalemate
			//Checar si hay algun movimimento posible para piezas del color del rey

			const friendlyPieces = tempPieces.filter(
				(p) => p.color === tempKing.color
			);

			const movementString = getMovementString(
				selectedPiece,
				pieces,
				x,
				y,
				isPossibleTake,
				kingOnCheck,
				isCommon,
				lastCoordinates,
				darkOnTop
			);

			// Si se movió uno blanco -> creamos objeto en el arreglo history
			// Si se movió uno negro -> lo agregamos al ultimo arreglo history
			const newHistory = getNewHistory(selectedPiece, movementString);
			setHistory(newHistory);

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

			setSelectedPiece(null);
			if (turn === "light") {
				setTurn("dark");
			} else {
				setTurn("light");
			}

			// Fix para renderizar capturas desde configuracion guardada
			var newCapturesBottom = capturesBottom;
			newCapturesBottom = darkOnTop
				? piece.color === "dark"
					? [...capturesBottom, piece]
					: capturesBottom
				: piece.color === "dark"
				? capturesBottom
				: [...capturesBottom, piece];

			var newCapturesTop = capturesTop;
			newCapturesTop = darkOnTop
				? piece.color === "dark"
					? capturesTop
					: [...capturesTop, piece]
				: piece.color === "dark"
				? [...capturesTop, piece]
				: capturesTop;

			saveGame(
				tempPieces,
				newHistory,
				newCapturesBottom,
				newCapturesTop,
				tempLightCheck,
				tempDarkCheck,
				tempCheckmate,
				tempStalemate,
				tempWinner
			);
			return;
		}

		// Si no es el turno de la pieza clickeada, no hacer nada
		if (piece.color !== turn) {
			return;
		}

		setSelectedPiece(piece);

		var possibleMovements = [];

		switch (piece.type) {
			case "pawn":
				possibleMovements = getPawnMovements(
					piece,
					x,
					y,
					darkOnTop,
					pieces,
					true,
					getLastMovement()
				);
				break;

			case "knight":
				possibleMovements = getKnightMovements(
					piece,
					x,
					y,
					pieces,
					darkOnTop,
					true
				);
				break;

			case "king":
				possibleMovements = getKingMovements(
					piece,
					x,
					y,
					pieces,
					darkOnTop,
					true
				);
				break;

			case "rook":
				possibleMovements = getRookMovements(
					piece,
					x,
					y,
					pieces,
					darkOnTop,
					true
				);
				break;

			case "bishop":
				possibleMovements = getBishopMovements(
					piece,
					x,
					y,
					pieces,
					darkOnTop,
					true
				);
				break;
			case "queen":
				possibleMovements = getQueenMovements(
					piece,
					x,
					y,
					pieces,
					darkOnTop,
					true
				);
				break;
		}

		setPossiblePieceMovements(possibleMovements);
	};

	// AQUI
	return (
		<div className="board">
			{numbers.map((number, y) => {
				return letters.map((letter, x) => {
					// Verificar si hay una pieza en un square usando ".some"
					const hasPiece = pieces.some((piece) => {
						return piece.position.x === x && piece.position.y === y;
					});
					const isPossibleMovement = possiblePieceMovements.some(
						(movement) => {
							return movement.x === x && movement.y === y;
						}
					);
					const isPossibleTake = possiblePieceMovements.some(
						(movement) => {
							return (
								movement.x === x &&
								movement.y === y &&
								movement.isTake
							);
						}
					);

					// Definir isCastle
					const isCastle = possiblePieceMovements.some((movement) => {
						return (
							movement.x === x &&
							movement.y === y &&
							movement.isCastle
						);
					});

					return (
						<div
							key={`p${x}${y}`}
							className={getSquareClassname(x, y, hasPiece)}
							onClick={() =>
								handlePieceClick(
									x,
									y,
									hasPiece,
									isPossibleMovement,
									isPossibleTake,
									isCastle
								)
							}
						>
							{x === 0 && (
								<span className="num-span">{number}</span>
							)}
							{y === 7 && (
								<span className="letter-span">{letter}</span>
							)}
							{pieces.map((piece) => {
								return (
									piece.position.x === x &&
									piece.position.y === y && (
										<img
											src={`/${piece.image}`}
											alt={piece.name}
										></img>
									)
								);
							})}
							{isPossibleMovement && (
								<div
									className={
										isPossibleTake
											? "take-icon"
											: "movement-icon"
									}
								></div>
							)}
						</div>
					);
				});
			})}
			{openPawnModal.open && (
				<PawnModal
					color={selectedPiece.color}
					x={selectedPiece.position.x}
					y={selectedPiece.position.y}
					selectedX={openPawnModal.coords}
					convertPawn={convertPawn}
				/>
			)}
		</div>
	);
};

export default Board;
