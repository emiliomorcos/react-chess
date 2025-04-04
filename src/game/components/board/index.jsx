import "./board.css";
import { useState } from "react";
import { defineInitialPositions } from "../../../constants";

// Generamos tablero
const Board = ({ numbers }) => {
	const darkOnTop = numbers[0] === "8";

	// Definimos letras de columnas
	const letters = darkOnTop
		? ["a", "b", "c", "d", "e", "f", "g", "h"]
		: ["h", "g", "f", "e", "d", "c", "b", "a"];

	const [pieces, setPieces] = useState(defineInitialPositions(numbers));
	const [possiblePieceMovements, setPossiblePieceMovements] = useState([]);

	// Definimos colores de cuadros con base en matriz y determinamos si hay una pieza en un square
	const getSquareClassname = (x, y, hasPiece) => {
		let classname = "square";
		classname += (x + y) % 2 === 0 ? " square-light" : " square-dark";
		classname += hasPiece ? " has-piece" : "";
		const isPossibleMovement = possiblePieceMovements.some((movement) => {
			return movement.x === x && movement.y === y;
		});

		classname += isPossibleMovement ? " possible-movement" : "";
		return classname;
	};
	// Definimos función para manejar el click de una pieza
	const handlePieceClick = (x, y, hasPiece) => {
		if (!hasPiece) {
			console.log("no piece here");
			return;
		}

		console.log("Posición: ", x, y);
		const piece = pieces.find((p) => {
			return p.position.x === x && p.position.y === y;
		});

		var possibleMovements = [];

		switch (piece.type) {
			case "pawn":
				possibleMovements = darkOnTop
					? piece.color === "dark"
						? [{ x, y: y + 1 }]
						: [{ x, y: y - 1 }]
					: piece.color === "dark"
					? [{ x, y: y - 1 }]
					: [{ x, y: y + 1 }];

				if (!piece.hasMoved) {
					possibleMovements.push(
						darkOnTop
							? piece.color === "dark"
								? { x, y: y + 2 }
								: { x, y: y - 2 }
							: piece.color === "dark"
							? { x, y: y - 2 }
							: { x, y: y + 2 }
					);
				}
				console.log(piece, "Posibles movimientos: ", possibleMovements);
				break;
		}

		setPossiblePieceMovements(possibleMovements);
	};

	return (
		<div className="board">
			{numbers.map((number, y) => {
				return letters.map((letter, x) => {
					// Verificar si hay una pieza en un square usando ".some"
					const hasPiece = pieces.some((piece) => {
						return piece.position.x === x && piece.position.y === y;
					});
					return (
						<div
							key={`p${x}${y}`}
							className={getSquareClassname(x, y, hasPiece)}
							onClick={() => handlePieceClick(x, y, hasPiece)}
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
						</div>
					);
				});
			})}
		</div>
	);
};

export default Board;
