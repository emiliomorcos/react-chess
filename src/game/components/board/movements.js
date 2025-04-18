const getFriendlyCollisions = (pieces, movement, piece) => {
	return pieces.some((p) => {
		return (
			p.position.x === movement.x &&
			p.position.y === movement.y &&
			p.color === piece.color
		);
	});
};

const isInsideBoard = (x, y) => {
	return x >= 0 && x <= 7 && y >= 0 && y <= 7;
};

// ----------- PAWNS -----------
const getPawnMovements = (piece, x, y, darkOnTop, pieces) => {
	var possibleMovements = [];

	possibleMovements = darkOnTop
		? piece.color === "dark"
			? [{ x, y: y + 1 }]
			: [{ x, y: y - 1 }]
		: piece.color === "dark"
		? [{ x, y: y - 1 }]
		: [{ x, y: y + 1 }];

	if (
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
	}

	const filteredMovements = possibleMovements.filter((movement) => {
		return (
			isInsideBoard(movement.x, movement.y) &&
			getFriendlyCollisions(pieces, movement, piece) === false
		);
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

	const filteredMovements = possibleMovements.filter((movement) => {
		return (
			isInsideBoard(movement.x, movement.y) &&
			getFriendlyCollisions(pieces, movement, piece) === false
		);
	});

	return filteredMovements;
};

// ----------- KINGS -----------
const getKingMovements = (piece, x, y, pieces) => {
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

	const filteredMovements = possibleMovements.filter((movement) => {
		return (
			isInsideBoard(movement.x, movement.y) &&
			getFriendlyCollisions(pieces, movement, piece) === false
		);
	});

	return filteredMovements;
};

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

			if (
				isInsideBoard(newX, newY) &&
				getFriendlyCollisions(pieces, { x: newX, y: newY }, piece) ===
					false
			) {
				possibleMovements.push({ x: newX, y: newY });
			} else {
				break;
			}
		}
	});

	return possibleMovements;
};

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

			if (
				isInsideBoard(newX, newY) &&
				getFriendlyCollisions(pieces, { x: newX, y: newY }, piece) ===
					false
			) {
				possibleMovements.push({ x: newX, y: newY });
			} else {
				break;
			}
		}
	});

	return possibleMovements;
};

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
};
