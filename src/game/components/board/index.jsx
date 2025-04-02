import "./board.css";
import { useState } from "react";
import { defineInitialPositions } from "../../../constants";

// Generamos tablero
const Board = ({ numbers }) => {
	const letters = ["a", "b", "c", "d", "e", "f", "g", "h"];
	const [pieces, setPieces] = useState(defineInitialPositions(numbers));

	const handlePieceClick = (x, y, hasPiece) => {
		if (!hasPiece) {
			console.log("no piece here");
			return;
		}

		const darkOnTop = numbers[0] === "8";

		console.log(x, y);
		const piece = pieces.find((p) => {
			return p.position.x === x && p.position.y === y;
		});

		// switch (piece.type) {
		// 	case "pawn":
		// 		var possibleMovements = darkOnTop ? piece.color === "dark" ? ;
		// 		break;
		// }
	};

	return (
		<div className="board">
			{numbers.map((number, x) => {
				return letters.map((letter, y) => {
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
							{y === 0 && (
								<span className="num-span">{number}</span>
							)}
							{x === 7 && (
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

// Definimos colores de cuadros con base en matriz y determinamos si hay una pieza en un square
const getSquareClassname = (x, y, hasPiece) => {
	let classname = "square";
	classname += (x + y) % 2 === 0 ? " square-light" : " square-dark";
	classname += hasPiece ? " has-piece" : "";
	return classname;
};

export default Board;
