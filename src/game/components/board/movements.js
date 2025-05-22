// Función para obtener los movimientos posibles de una pieza Y saber si empatan con los movimientos de un rey
const getPieceMovements = (piece, x, y, pieces, darkOnTop) => {
	var possibleMovements = [];

	switch (piece.type) {
		case "pawn":
			possibleMovements = darkOnTop
				? piece.color === "dark"
					? [
							{ x: x - 1, y: y + 1 },
							{ x: x + 1, y: y + 1 },
					  ]
					: [
							{ x: x - 1, y: y - 1 },
							{ x: x + 1, y: y - 1 },
					  ]
				: piece.color === "dark"
				? [
						{ x: x - 1, y: y - 1 },
						{ x: x + 1, y: y - 1 },
				  ]
				: [
						{ x: x - 1, y: y + 1 },
						{ x: x + 1, y: y + 1 },
				  ];
			break;

		case "knight":
			possibleMovements = getKnightMovements(piece, x, y, pieces);
			break;

		case "king":
			possibleMovements = getKingRawMovements(piece, x, y, pieces);
			break;

		case "rook":
			possibleMovements = getRookMovements(piece, x, y, pieces);
			break;

		case "bishop":
			possibleMovements = getBishopMovements(piece, x, y, pieces);
			break;
		case "queen":
			possibleMovements = getQueenMovements(piece, x, y, pieces);
			break;
	}

	return possibleMovements;
};

// Función para sacar los movimientos posibles del rey opuesto y evitar ciclos
const getKingRawMovements = (piece, x, y, pieces) => {
	var possibleMovements = [
		{ x: x - 1, y: y - 1 },
		{ x: x - 1, y: y },
		{ x: x - 1, y: y + 1 },
		{ x: x, y: y - 1 },
		{ x: x, y: y + 1 },
		{ x: x + 1, y: y - 1 },
		{ x: x + 1, y: y },
		{ x: x + 1, y: y + 1 },
	];

	var filteredMovements = possibleMovements.filter((movement) => {
		return (
			isInsideBoard(movement.x, movement.y) &&
			getFriendlyCollisions(pieces, movement, piece) === false
		);
	});

	return filteredMovements;
};

const movePieceOnTake = (tempPieces, selectedPiece, x, y) => {
	const tempPiece = tempPieces.find((p) => {
		return (
			p.position.x === selectedPiece.position.x &&
			p.position.y === selectedPiece.position.y
		);
	});

	const pieceIndex = tempPieces.indexOf(tempPiece);
	tempPieces[pieceIndex].position.x = x;
	tempPieces[pieceIndex].position.y = y;
	tempPieces[pieceIndex].hasMoved = true;

	return tempPieces;
};

const getFriendlyCollisions = (pieces, movement, piece) => {
	return pieces.some((p) => {
		return (
			p.position.x === movement.x &&
			p.position.y === movement.y &&
			p.color === piece.color
		);
	});
};

// Identficar los posibles movmientos de un rey tomando en cuenta la visión de las piezas enemigas
const isValidKingMovement = (pieces, movement, piece, darkOnTop) => {
	const { color: kingColor } = piece;
	const { x, y } = movement;
	const enemyPieces = pieces.filter((p) => p.color !== kingColor);

	for (let i = 0; i < enemyPieces.length; i++) {
		var enemyPiece = enemyPieces[i];

		const enemyPieceMovements = getPieceMovements(
			enemyPiece,
			enemyPiece.position.x,
			enemyPiece.position.y,
			pieces,
			darkOnTop
		);

		if (
			enemyPieceMovements.length &&
			enemyPieceMovements.some((enemyPM) => {
				return enemyPM.x === x && enemyPM.y === y;
			})
		) {
			return false;
		}
	}
	return true;
};

const getPossibleTakes = (pieces, movement, piece) => {
	return pieces.some((p) => {
		return (
			p.position.x === movement.x &&
			p.position.y === movement.y &&
			p.color !== piece.color
		);
	});
};

const isInsideBoard = (x, y) => {
	return x >= 0 && x <= 7 && y >= 0 && y <= 7;
};

// ----------- PAWNS -----------
// TODO: EN PASSANT
const getPawnMovements = (piece, x, y, darkOnTop, pieces) => {
	var possibleMovements = [];

	possibleMovements = darkOnTop
		? piece.color === "dark"
			? [{ x, y: y + 1 }]
			: [{ x, y: y - 1 }]
		: piece.color === "dark"
		? [{ x, y: y - 1 }]
		: [{ x, y: y + 1 }];

	// Usamos getPossibleTakes para ver si hay una pieza enemiga enfrente y quitar el movimiento
	if (getPossibleTakes(pieces, possibleMovements[0], piece)) {
		possibleMovements.pop();
	}

	if (
		possibleMovements.length &&
		!piece.hasMoved &&
		!getFriendlyCollisions(pieces, possibleMovements[0], piece)
	) {
		possibleMovements.push(
			darkOnTop
				? piece.color === "dark"
					? { x, y: y + 2 }
					: { x, y: y - 2 }
				: piece.color === "dark"
				? { x, y: y - 2 }
				: { x, y: y + 2 }
		);

		if (
			getPossibleTakes(
				pieces,
				possibleMovements[possibleMovements.length - 1],
				piece
			)
		) {
			possibleMovements.pop();
		}
	}

	const possibleTakes = darkOnTop
		? piece.color === "dark"
			? [
					{ x: x + 1, y: y + 1 },
					{ x: x - 1, y: y + 1 },
			  ]
			: [
					{ x: x + 1, y: y - 1 },
					{ x: x - 1, y: y - 1 },
			  ]
		: piece.color === "dark"
		? [
				{ x: x + 1, y: y - 1 },
				{ x: x - 1, y: y - 1 },
		  ]
		: [
				{ x: x + 1, y: y + 1 },
				{ x: x - 1, y: y + 1 },
		  ];

	const filteredMovements = possibleMovements.filter((movement) => {
		return (
			isInsideBoard(movement.x, movement.y) &&
			getFriendlyCollisions(pieces, movement, piece) === false
		);
	});

	possibleTakes.forEach((take) => {
		if (getPossibleTakes(pieces, take, piece)) {
			filteredMovements.push({ ...take, isTake: true });
		}
	});

	return filteredMovements;
};

// ----------- KNIGHTS -----------
const getKnightMovements = (piece, x, y, pieces) => {
	var possibleMovements = [
		{ x: x - 2, y: y - 1 },
		{ x: x - 2, y: y + 1 },
		{ x: x + 2, y: y - 1 },
		{ x: x + 2, y: y + 1 },
		{ x: x - 1, y: y - 2 },
		{ x: x - 1, y: y + 2 },
		{ x: x + 1, y: y - 2 },
		{ x: x + 1, y: y + 2 },
	];

	var filteredMovements = possibleMovements.filter((movement) => {
		return (
			isInsideBoard(movement.x, movement.y) &&
			getFriendlyCollisions(pieces, movement, piece) === false
		);
	});

	filteredMovements = filteredMovements.map((movement) => {
		return getPossibleTakes(pieces, movement, piece)
			? { ...movement, isTake: true }
			: movement;
	});

	return filteredMovements;
};

// ----------- KINGS -----------
const getKingMovements = (piece, x, y, pieces, darkOnTop) => {
	var possibleMovements = [
		{ x: x - 1, y: y - 1 },
		{ x: x - 1, y: y },
		{ x: x - 1, y: y + 1 },
		{ x: x, y: y - 1 },
		{ x: x, y: y + 1 },
		{ x: x + 1, y: y - 1 },
		{ x: x + 1, y: y },
		{ x: x + 1, y: y + 1 },
	];

	var filteredMovements = possibleMovements.filter((movement) => {
		return (
			isInsideBoard(movement.x, movement.y) &&
			getFriendlyCollisions(pieces, movement, piece) === false
		);
	});

	filteredMovements = filteredMovements.map((movement) => {
		return getPossibleTakes(pieces, movement, piece)
			? { ...movement, isTake: true }
			: movement;
	});

	var filteredMovements = filteredMovements.filter((movement) => {
		return isValidKingMovement(pieces, movement, piece, darkOnTop);
	});

	return filteredMovements;
};

// ----------- ROOKS -----------
const getRookMovements = (piece, x, y, pieces) => {
	var possibleMovements = [];

	const directions = [
		{ dx: 0, dy: -1 }, // UP
		{ dx: 0, dy: 1 }, // DOWN
		{ dx: -1, dy: 0 }, // LEFT
		{ dx: 1, dy: 0 }, // RIGHT
	];

	directions.forEach(({ dx, dy }) => {
		for (let i = 1; i < 8; i++) {
			let newX = x + dx * i;
			let newY = y + dy * i;

			if (isInsideBoard(newX, newY)) {
				if (getPossibleTakes(pieces, { x: newX, y: newY }, piece)) {
					possibleMovements.push({ x: newX, y: newY, isTake: true });
					break;
				}
				if (
					getFriendlyCollisions(
						pieces,
						{ x: newX, y: newY },
						piece
					) === false
				) {
					possibleMovements.push({ x: newX, y: newY });
				} else {
					break;
				}
			} else {
				break;
			}
		}
	});

	return possibleMovements;
};

// ----------- BISHOPS -----------
const getBishopMovements = (piece, x, y, pieces) => {
	var possibleMovements = [];

	const directions = [
		{ dx: 1, dy: -1 }, // UP RIGHT
		{ dx: -1, dy: -1 }, // UP LEFT
		{ dx: 1, dy: 1 }, // DOWN RIGHT
		{ dx: -1, dy: 1 }, // DOWN LEFT
	];

	directions.forEach(({ dx, dy }) => {
		for (let i = 1; i < 8; i++) {
			let newX = x + dx * i;
			let newY = y + dy * i;

			if (isInsideBoard(newX, newY)) {
				if (getPossibleTakes(pieces, { x: newX, y: newY }, piece)) {
					possibleMovements.push({ x: newX, y: newY, isTake: true });
					break;
				}
				if (
					getFriendlyCollisions(
						pieces,
						{ x: newX, y: newY },
						piece
					) === false
				) {
					possibleMovements.push({ x: newX, y: newY });
				} else {
					break;
				}
			} else {
				break;
			}
		}
	});

	return possibleMovements;
};

// ----------- QUEEN -----------
const getQueenMovements = (piece, x, y, pieces) => {
	var possibleMovements = [
		...getRookMovements(piece, x, y, pieces),
		...getBishopMovements(piece, x, y, pieces),
	];

	return possibleMovements;
};

export {
	getPawnMovements,
	getKnightMovements,
	getKingMovements,
	getRookMovements,
	getBishopMovements,
	getQueenMovements,
	movePieceOnTake,
};
