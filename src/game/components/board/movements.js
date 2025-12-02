// Función para obtener los movimientos posibles de una pieza Y saber si empatan con los movimientos de un rey
const getPieceMovements = (
	piece,
	x,
	y,
	pieces,
	darkOnTop,
	fromBoard = false,
	lastMovement = ""
) => {
	var possibleMovements = [];

	switch (piece.type) {
		case "pawn":
			possibleMovements = fromBoard
				? getPawnMovements(
						piece,
						x,
						y,
						darkOnTop,
						pieces,
						fromBoard,
						lastMovement
				  )
				: darkOnTop
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
			possibleMovements = getKnightMovements(
				piece,
				x,
				y,
				pieces,
				darkOnTop,
				fromBoard
			);
			break;

		case "king":
			possibleMovements = fromBoard
				? getKingMovements(piece, x, y, pieces, darkOnTop, fromBoard)
				: getKingRawMovements(piece, x, y, pieces);
			break;

		case "rook":
			possibleMovements = getRookMovements(
				piece,
				x,
				y,
				pieces,
				darkOnTop,
				fromBoard
			);
			break;

		case "bishop":
			possibleMovements = getBishopMovements(
				piece,
				x,
				y,
				pieces,
				darkOnTop,
				fromBoard,
				darkOnTop
			);
			break;
		case "queen":
			possibleMovements = getQueenMovements(
				piece,
				x,
				y,
				pieces,
				darkOnTop,
				fromBoard
			);
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

const movePieceOnTake = (tempPieces, selectedPiece, x, y, isTake = false) => {
	const tempPiece = tempPieces.find((p) => {
		return (
			p.position.x === selectedPiece.position.x &&
			p.position.y === selectedPiece.position.y
		);
	});

	if (isTake) {
		const tempRemovedPiece = tempPieces.find((piece) => {
			return piece.position.x === x && piece.position.y === y;
		});

		const tempRemovedPieceIndex = tempPieces.indexOf(tempRemovedPiece);

		if (tempRemovedPiece) {
			tempPieces.splice(tempRemovedPieceIndex, 1);
		}
	}

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

// Identficar los posibles movimientos de un rey tomando en cuenta la visión de las piezas enemigas
const isKingOnCheck = (pieces, movement, piece, darkOnTop) => {
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

// FUNCION PARA CHECAR EN PASSANT
const checkEnPassant = (pieces, piece, lastx, lasty) => {
	// Checar si hay una pieza enemiga a la izquierda
	const leftPiece = pieces.find((p) => {
		return (
			p.position.x === piece.position.x - 1 &&
			p.position.y === piece.position.y &&
			p.type === "pawn" &&
			p.color !== piece.color
		);
	});

	const rightPiece = pieces.find((p) => {
		return (
			p.position.x === piece.position.x + 1 &&
			p.position.y === piece.position.y &&
			p.type === "pawn" &&
			p.color !== piece.color
		);
	});

	if (leftPiece) {
		// Checar si ese peon fue el último movimiento
		if (
			// checamos lastx y lasty por el peon en 0 y luego comparamos con leftpiece
			lastx !== undefined &&
			lasty !== NaN &&
			leftPiece.position.x === lastx &&
			leftPiece.position.y === lasty
		) {
			return true;
		}
	}

	if (rightPiece) {
		// Checar si ese peon fue el último movimiento
		if (
			// checamos lastx y lasty por el peon en 0 y luego comparamos con leftpiece
			lastx !== undefined &&
			lasty !== NaN &&
			rightPiece.position.x === lastx &&
			rightPiece.position.y === lasty
		) {
			// Si es posible, agregar movimiento a filteredMovements
			return true;
		}
	}

	return false;
};

// ----------- PAWNS -----------
const getPawnMovements = (
	piece,
	x,
	y,
	darkOnTop,
	pieces,
	fromBoard = false,
	lastMovement
) => {
	console.log("Entramos a getPawnMovements");
	var possibleMovements = [];

	possibleMovements = darkOnTop
		? piece.color === "dark"
			? [{ x, y: y + 1 }]
			: [{ x, y: y - 1 }]
		: piece.color === "dark"
		? [{ x, y: y - 1 }]
		: [{ x, y: y + 1 }];

	console.log("possibleMovements primera iteración", possibleMovements);

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
		console.log("possibleMovements segunda iteración", possibleMovements);

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

	var filteredMovements = possibleMovements.filter((movement) => {
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

	// ----------- EN PASSANT -----------
	const xvalues = {
		a: 7,
		b: 6,
		c: 5,
		d: 4,
		e: 3,
		f: 2,
		g: 1,
		h: 0,
	};

	const darkxvalues = {
		a: 0,
		b: 1,
		c: 2,
		d: 3,
		e: 4,
		f: 5,
		g: 6,
		h: 7,
	};

	const lastx = darkOnTop
		? darkxvalues[lastMovement[0]]
		: xvalues[lastMovement[0]];
	var lasty = lastMovement[1];
	lasty = parseInt(lasty);

	lasty = lasty ? (darkOnTop ? 8 - lasty : lasty - 1) : lasty;

	// ----------- EN PASSANT fila 3 -----------
	if (y === 3) {
		//Pasar lastMovement de string a coordenadas (x,y)

		if (darkOnTop && piece.color === "light") {
			if (checkEnPassant(pieces, piece, lastx, lasty)) {
				filteredMovements.push({
					x: lastx,
					y: lasty - 1,
					isTake: true,
				});
			}
		}

		if (!darkOnTop && piece.color === "dark") {
			if (checkEnPassant(pieces, piece, lastx, lasty)) {
				filteredMovements.push({
					x: lastx,
					y: lasty - 1,
					isTake: true,
				});
			}
		}
	}

	// ----------- EN PASSANT fila 4 -----------
	if (y === 4) {
		if (!darkOnTop && piece.color === "light") {
			if (checkEnPassant(pieces, piece, lastx, lasty)) {
				filteredMovements.push({
					x: lastx,
					y: lasty + 1,
					isTake: true,
				});
			}
		}

		if (darkOnTop && piece.color === "dark") {
			if (checkEnPassant(pieces, piece, lastx, lasty)) {
				filteredMovements.push({
					x: lastx,
					y: lasty + 1,
					isTake: true,
				});
			}
		}
	}

	if (fromBoard) {
		const tempKing = pieces.find((p) => {
			return p.type === "king" && p.color === piece.color;
		});

		filteredMovements = filteredMovements.filter((movement) => {
			var tempPieces = JSON.parse(JSON.stringify(pieces));

			var tempPieces = movePieceOnTake(
				tempPieces,
				piece,
				movement.x,
				movement.y,
				movement.isTake
			);

			return isKingOnCheck(
				tempPieces,
				tempKing.position,
				tempKing,
				darkOnTop
			);
		});
	}

	return filteredMovements;
};

// ----------- KNIGHTS -----------
const getKnightMovements = (
	piece,
	x,
	y,
	pieces,
	darkOnTop,
	fromBoard = false
) => {
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

	if (fromBoard) {
		const tempKing = pieces.find((p) => {
			return p.type === "king" && p.color === piece.color;
		});

		filteredMovements = filteredMovements.filter((movement) => {
			var tempPieces = JSON.parse(JSON.stringify(pieces));

			var tempPieces = movePieceOnTake(
				tempPieces,
				piece,
				movement.x,
				movement.y,
				movement.isTake
			);

			return isKingOnCheck(
				tempPieces,
				tempKing.position,
				tempKing,
				darkOnTop
			);
		});
	}

	return filteredMovements;
};

/*
1. que no se hayan movido rey ni torre
2. que no haya piezas entre rey y torre
3. que ningun cuadro entre rey y torre esté atacado
*/

// ----------- KINGS -----------
const getKingMovements = (
	piece,
	x,
	y,
	pieces,
	darkOnTop,
	fromBoard = false
) => {
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

	if (!piece.hasMoved) {
		// Encontrar las torres amigas
		const rook1 = pieces.find((p) => {
			return p.type === "rook" && p.color === piece.color;
		});

		const rook2 = pieces.find((p) => {
			return (
				p.type === "rook" &&
				p.color === piece.color &&
				p.name !== rook1?.name
			);
		});
		// ver si las torres amigas no se han movido
		if (rook1 && !rook1.hasMoved) {
			const rook1Movements = getRookMovements(
				rook1,
				rook1.position.x,
				rook1.position.y,
				pieces,
				darkOnTop
			);

			var castle1 = false;

			if (rook1.position.x === 0) {
				if (rook1Movements.length >= 3) {
					for (let i = 1; i < 4; i++) {
						// Si no tiene el movimiento que se salga del for (que ya no cheque más)
						if (
							!rook1Movements.some((m) => {
								return (
									m.x === rook1.position.x + i &&
									m.y === rook1.position.y
								);
							})
						) {
							castle1 = false;
							break;
						}
						if (
							!isKingOnCheck(
								pieces,
								{
									x: rook1.position.x + i,
									y: rook1.position.y,
								},
								piece,
								darkOnTop
							)
						) {
							castle1 = false;
							break;
						}
						castle1 = true;
					}
				}
				if (castle1) {
					filteredMovements.push({
						x: piece.position.x - 2,
						y: piece.position.y,
						isCastle: true,
					});
				}
			} else {
				// Rook 2 cuando mataron a Rook 1 (rook 2 toma el lugar de rook 1)
				if (rook1Movements.length >= 2) {
					for (let i = 2; i > 0; i--) {
						// Si no tiene el movimiento que se salga del for (que ya no cheque más)
						if (
							!rook1Movements.some((m) => {
								return (
									m.x === rook1.position.x - i &&
									m.y === rook1.position.y
								);
							})
						) {
							castle1 = false;
							break;
						}
						if (
							!isKingOnCheck(
								pieces,
								{
									x: rook1.position.x - i,
									y: rook1.position.y,
								},
								piece,
								darkOnTop
							)
						) {
							castle1 = false;
							break;
						}
						castle1 = true;
					}
				}
				if (castle1) {
					filteredMovements.push({
						x: piece.position.x + 2,
						y: piece.position.y,
						isCastle: true,
					});
				}
			}
		}

		if (rook2 && !rook2.hasMoved) {
			const rook2Movements = getRookMovements(
				rook2,
				rook2.position.x,
				rook2.position.y,
				pieces,
				darkOnTop
			);

			var castle2 = false;

			if (rook2Movements.length >= 2) {
				for (let i = 2; i > 0; i--) {
					// Si no tiene el movimiento que se salga del for (que ya no cheque más)
					if (
						!rook2Movements.some((m) => {
							return (
								m.x === rook2.position.x - i &&
								m.y === rook2.position.y
							);
						})
					) {
						castle1 = false;
						break;
					}
					if (
						!isKingOnCheck(
							pieces,
							{
								x: rook2.position.x - i,
								y: rook2.position.y,
							},
							piece,
							darkOnTop
						)
					) {
						castle2 = false;
						break;
					}
					castle2 = true;
				}
				if (castle2) {
					filteredMovements.push({
						x: piece.position.x + 2,
						y: piece.position.y,
						isCastle: true,
					});
				}
			}
		}

		// Checar possible movements de las torres entre rey y torre

		// Revisar que no estén atacados los cuadros entre rey y torre
	}

	if (fromBoard) {
		const tempKing = pieces.find((p) => {
			return p.type === "king" && p.color === piece.color;
		});

		filteredMovements = filteredMovements.filter((movement) => {
			var tempPieces = JSON.parse(JSON.stringify(pieces));

			var tempPieces = movePieceOnTake(
				tempPieces,
				piece,
				movement.x,
				movement.y,
				movement.isTake
			);

			return isKingOnCheck(
				tempPieces,
				{ x: movement.x, y: movement.y },
				tempKing,
				darkOnTop
			);
		});
	}

	return filteredMovements;
};

// ----------- ROOKS -----------
const getRookMovements = (
	piece,
	x,
	y,
	pieces,
	darkOnTop,
	fromBoard = false
) => {
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

	if (fromBoard) {
		const tempKing = pieces.find((p) => {
			return p.type === "king" && p.color === piece.color;
		});

		possibleMovements = possibleMovements.filter((movement) => {
			var tempPieces = JSON.parse(JSON.stringify(pieces));

			var tempPieces = movePieceOnTake(
				tempPieces,
				piece,
				movement.x,
				movement.y,
				movement.isTake
			);

			return isKingOnCheck(
				tempPieces,
				tempKing.position,
				tempKing,
				darkOnTop
			);
		});
	}

	return possibleMovements;
};

// ----------- BISHOPS -----------
const getBishopMovements = (
	piece,
	x,
	y,
	pieces,
	darkOnTop,
	fromBoard,
	isTake
) => {
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

	// Checar que movimientos no pongan en jaque

	// Por cada movimiento (loop) --> simular movimiento de pieza -> extraer rey y revisar isKingOnCheck

	if (fromBoard) {
		const tempKing = pieces.find((p) => {
			return p.type === "king" && p.color === piece.color;
		});

		possibleMovements = possibleMovements.filter((movement) => {
			var tempPieces = JSON.parse(JSON.stringify(pieces));

			var tempPieces = movePieceOnTake(
				tempPieces,
				piece,
				movement.x,
				movement.y,
				movement.isTake
			);

			return isKingOnCheck(
				tempPieces,
				tempKing.position,
				tempKing,
				darkOnTop
			);
		});
	}

	return possibleMovements;
};

// ----------- QUEEN -----------
const getQueenMovements = (
	piece,
	x,
	y,
	pieces,
	darkOnTop,
	fromBoard = false
) => {
	var possibleMovements = [
		...getRookMovements(piece, x, y, pieces, darkOnTop, fromBoard),
		...getBishopMovements(piece, x, y, pieces, darkOnTop, fromBoard),
	];

	return possibleMovements;
};

// ----------- MOVEMENT STRING -----------

const getMovementString = (
	piece,
	pieces,
	x,
	y,
	isTake,
	isKingOnCheck,
	isCommon,
	lastCoordinates,
	darkOnTop,
	conversionType = ""
) => {
	const xvalues = {
		0: "a",
		1: "b",
		2: "c",
		3: "d",
		4: "e",
		5: "f",
		6: "g",
		7: "h",
	};

	const typeLetter = {
		rook: "R",
		bishop: "B",
		queen: "Q",
		knight: "N",
		king: "K",
	};

	var movementString = "";
	if (piece.type === "pawn") {
		if (isTake) {
			movementString += darkOnTop
				? xvalues[lastCoordinates.x]
				: xvalues[7 - lastCoordinates.x];
			movementString += "x";
		}
		movementString += darkOnTop ? xvalues[x] : xvalues[7 - x];
		movementString += darkOnTop ? `${8 - y}` : `${y + 1}`;

		if (isKingOnCheck) {
			movementString += "+";
		}
	} else {
		movementString += typeLetter[piece.type];

		if (isCommon) {
			const commonPiece = pieces.find((p) => {
				return (
					p.type === piece.type &&
					p.color === piece.color &&
					p.name !== piece.name
				);
			});

			if (lastCoordinates.x === commonPiece.position.x) {
				movementString += darkOnTop
					? `${8 - lastCoordinates.y}`
					: `${lastCoordinates.y + 1}`;
			} else {
				movementString += darkOnTop
					? xvalues[lastCoordinates.x]
					: xvalues[7 - lastCoordinates.x];
			}
		}

		if (isTake) {
			movementString += "x";
		}

		movementString += darkOnTop ? xvalues[x] : xvalues[7 - x];
		movementString += darkOnTop ? `${8 - y}` : `${y + 1}`;

		if (isKingOnCheck) {
			movementString += "+";
		}
		// Comparar lasCoordinates y coordenadas de commonPiece
		// Si la x es igual usamos la y (num), s la y es igual usamos la x (letra), si ninguno es igual usamos la x (letra)
	}

	if (conversionType) {
		movementString += `=${typeLetter[conversionType]}`;
	}
	return movementString;
};

const getMovementsInCommon = (
	piece1Movements,
	piece2,
	pieces,
	darkOnTop,
	fromBoard
) => {
	const piece2Movements =
		piece2.type === "knight"
			? getKnightMovements(
					piece2,
					piece2.position.x,
					piece2.position.y,
					pieces,
					darkOnTop,
					fromBoard
			  )
			: getRookMovements(
					piece2,
					piece2.position.x,
					piece2.position.y,
					pieces,
					darkOnTop,
					fromBoard
			  );

	const commonMovements = piece1Movements.filter((movement) => {
		return piece2Movements.some((movement2) => {
			return movement2.x === movement.x && movement2.y === movement.y;
		});
	});
	return commonMovements;
};

const validateMovement = (pieces, piece, movement, darkOnTop, lastMovement) => {
	const xvalues = {
		a: 7,
		b: 6,
		c: 5,
		d: 4,
		e: 3,
		f: 2,
		g: 1,
		h: 0,
	};

	const darkxvalues = {
		a: 0,
		b: 1,
		c: 2,
		d: 3,
		e: 4,
		f: 5,
		g: 6,
		h: 7,
	};

	const pieceX = piece[0];
	const pieceY = parseInt(piece[1]);
	const pieceCoords = {
		x: darkOnTop ? darkxvalues[pieceX] : xvalues[pieceX],
		y: darkOnTop ? 8 - pieceY : pieceY - 1,
	};

	console.log("pieceCoords", pieceCoords);

	// Sacamos el movement string limpio para convertirlo a coordenadas
	const cleanMovement = ["N", "R", "B", "Q", "K", "x", "+", "#"];

	// Quitamos caracteres innecesarios
	let i = 0;
	while (movement.length > 2) {
		movement = movement.replace(cleanMovement[i], "");
		i++;

		if (i > cleanMovement.length - 1) {
			movement = movement.slice(1);
		}
	}
	console.log("cleaned movement", movement);

	// Convertirmos a coordenadas
	const movementX = movement[0];
	const movementY = parseInt(movement[1]);
	const movementCoords = {
		x: darkOnTop ? darkxvalues[movementX] : xvalues[movementX],
		y: darkOnTop ? 8 - movementY : movementY - 1,
	};

	console.log("movement coords", movementCoords);

	// Revisamos si el movimiento está en possible movements de la pieza a mover
	const selectedPiece = pieces.find((p) => {
		return p.position.x === pieceCoords.x && p.position.y === pieceCoords.y;
	});

	console.log("selectedPiece", selectedPiece);

	const possibleMovements =
		selectedPiece.type === "pawn"
			? getPawnMovements(
					selectedPiece,
					pieceCoords.x,
					pieceCoords.y,
					darkOnTop,
					pieces,
					true,
					lastMovement
			  )
			: getPieceMovements(
					selectedPiece,
					pieceCoords.x,
					pieceCoords.y,
					pieces,
					darkOnTop,
					true,
					lastMovement
			  );

	console.log("possibleMovements", possibleMovements);

	// Validar que el movimiento sea posible con coordenadas y extraerlo con el find
	const checkMovement = possibleMovements.find((pm) => {
		return pm.x === movementCoords.x && pm.y === movementCoords.y;
	});

	const isValid = checkMovement ? true : false;

	return {
		isValid,
		piece: selectedPiece,
		movement: movementCoords,
		isTake: checkMovement?.isTake ? true : false,
	};

	// Estructura del return
	// {isValid: bool, piece: coords, movement: coord, isTake:bool}
};

export {
	getPawnMovements,
	getKnightMovements,
	getKingMovements,
	getRookMovements,
	getBishopMovements,
	getQueenMovements,
	movePieceOnTake,
	isKingOnCheck,
	getPieceMovements,
	getMovementString,
	getMovementsInCommon,
	validateMovement,
};
