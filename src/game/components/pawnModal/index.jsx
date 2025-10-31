import React from "react";
import "./pawnModal.css";

const PawnModal = ({ color, x, y, convertPawn }) => {
	return (
		<div
			className="pawn-modal"
			style={{
				left: `calc(calc(80vh/8)*${x})`,
				bottom: y === 6 ? 0 : undefined,
			}}
		>
			<div
				className={`${color}-queen squareModal`}
				onClick={() => convertPawn("queen")}
			>
				.
			</div>
			<div
				className={`${color}-rook squareModal`}
				onClick={() => convertPawn("rook")}
			>
				.
			</div>
			<div
				className={`${color}-bishop squareModal`}
				onClick={() => convertPawn("bishop")}
			>
				.
			</div>
			<div
				className={`${color}-knight squareModal`}
				onClick={() => convertPawn("knight")}
			>
				.
			</div>
		</div>
	);
};

export default PawnModal;
