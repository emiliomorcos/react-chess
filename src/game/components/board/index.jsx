import "./board.css";
import { useState } from "react";
import { defineInitialPositions } from "../../../constants";
import {
	getPawnMovements,
	getKnightMovements,
	getKingMovements,
	getRookMovements,
	getBishopMovements,
	getQueenMovements,
	movePieceOnTake,
	isKingOnCheck,
} from "./movements";

// Generamos tablero
const Board = ({
	numbers,
	capturesTop,
	setCapturesTop,
	capturesBottom,
	setCapturesBottom,
}) => {
	const darkOnTop = numbers[0] === "8";

	// Definimos letras de columnas
	const letters = darkOnTop
		? ["a", "b", "c", "d", "e", "f", "g", "h"]
		: ["h", "g", "f", "e", "d", "c", "b", "a"];

	const [pieces, setPieces] = useState(defineInitialPositions(numbers));
	const [possiblePieceMovements, setPossiblePieceMovements] = useState([]);
	const [selectedPiece, setSelectedPiece] = useState(null);
	const [lightKingOnCheck, setLightKingOnCheck] = useState(false);
	const [darkKingOnCheck, setDarkKingOnCheck] = useState(false);

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
		isPossibleTake
	) => {
		if (!hasPiece) {
			if (isPossibleMovement) {
				const tempPieces = movePieceOnTake(
					[...pieces],
					selectedPiece,
					x,
					y
				);

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
					} else {
						setDarkKingOnCheck(true);
					}
				} else {
					setLightKingOnCheck(false);
					setDarkKingOnCheck(false);
				}

				// Revisar si hay jaque mate
				//Checar si hay algun movimimento posible para piezas del color del rey

				setSelectedPiece(null);
			}
			return;
		}

		const piece = pieces.find((p) => {
			return p.position.x === x && p.position.y === y;
		});

		// Checar si el square con pieza es un possible movement && isTake === true
		if (isPossibleTake) {
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
				} else {
					setDarkKingOnCheck(true);
				}
			} else {
				setLightKingOnCheck(false);
				setDarkKingOnCheck(false);
			}

			//Revisar si hay jaque mate
			//Checar si hay algun movimimento posible para piezas del color del rey

			setSelectedPiece(null);
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
					true
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
									isPossibleTake
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
								<div className="movement-icon"></div>
							)}
						</div>
					);
				});
			})}
		</div>
	);
};

export default Board;
