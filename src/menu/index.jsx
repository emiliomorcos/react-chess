import React from "react";
import { Button, message } from "antd";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { defineNumbers } from "../game";
import { defineInitialPositions } from "../constants";
import "./menu.css";

//TODO: Agregar jugar al dar click a Enter
const Menu = () => {
	const [gameType, setGameType] = useState("two-players");
	const [difficulty, setDifficulty] = useState("facil");
	const [player1, setPlayer1] = useState("");
	const [player2, setPlayer2] = useState("");
	const [color, setColor] = useState("white");
	const [configuration, setConfiguration] = useState({});

	useEffect(() => {
		const tempConfiguration = JSON.parse(
			localStorage.getItem(`${gameType}_${color}`)
		);
		console.log("tempConfiguration", tempConfiguration);

		setConfiguration(tempConfiguration);
	}, [gameType, color]);

	const navigate = useNavigate();
	const [messageApi, contextHolder] = message.useMessage();

	const newGame = () => {
		const newConfiguration = {
			pieces: defineInitialPositions(
				defineNumbers(`${gameType}_${color}`)
			),
			history: [],
			player1: player1,
			player2: player2,
			capturesTop: [],
			capturesBottom: [],
			gametype: gameType,
			difficulty: difficulty,
			turn: "light",
			isNew: true,
			lightKingOnCheck: false,
			darkKingOnCheck: false,
		};

		localStorage.setItem(
			`${gameType}_${color}`,
			JSON.stringify(newConfiguration)
		);

		navigate(
			`/game/${gameType}_${color}/${player1}/${
				gameType === "two-players" ? player2 : "default"
			}/${gameType === "two-players" ? "default" : difficulty}`
		);
	};

	const handlePlay = (isNewGame) => {
		if (gameType === "two-players" && (!player1 || !player2) && isNewGame) {
			messageApi.open({
				type: "error",
				content: "Por favor ingresa el nombre de ambos jugadores",
			});
			return;
		} else if (gameType === "ai" && !player1 && isNewGame) {
			messageApi.open({
				type: "error",
				content: "Por favor ingresa el nombre del jugador",
			});
			return;
		} else {
			if (isNewGame) {
				newGame();
			} else {
				navigate(
					`/game/${gameType}_${color}/${configuration.player1}/${
						gameType === "two-players"
							? configuration.player2
							: "default"
					}/${
						gameType === "two-players"
							? "default"
							: configuration.difficulty
					}`
				);
			}
		}
	};

	return (
		<div className="menu-container">
			{contextHolder}
			<div className="menu">
				<h1>Ajedrez!</h1>
				<div className="buttons">
					<Button
						type={
							gameType === "two-players" ? "primary" : "default"
						}
						onClick={() => {
							setGameType("two-players"), setColor("white");
						}}
					>
						2 jugadores
					</Button>
					<Button
						type={
							gameType !== "two-players" ? "primary" : "default"
						}
						onClick={() => setGameType("ai")}
					>
						Contra IA
					</Button>
				</div>

				<h3>Nombre Jugador 1</h3>
				<input
					type="text"
					placeholder="Ingresa el nombre"
					onChange={(e) => setPlayer1(e.target.value)}
				/>

				{gameType === "two-players" ? (
					<>
						<h3>Nombre Jugador 2</h3>
						<input
							type="text"
							placeholder="Ingresa el nombre"
							onChange={(e) => setPlayer2(e.target.value)}
						/>
					</>
				) : (
					<>
						<h3>Dificultad</h3>
						<div className="buttons">
							<Button
								type={
									difficulty === "facil"
										? "primary"
										: "default"
								}
								onClick={() => setDifficulty("facil")}
							>
								Fácil
							</Button>
							<Button
								type={
									difficulty === "medio"
										? "primary"
										: "default"
								}
								onClick={() => setDifficulty("medio")}
							>
								Medio
							</Button>
							<Button
								type={
									difficulty === "dificil"
										? "primary"
										: "default"
								}
								onClick={() => setDifficulty("dificil")}
							>
								Difícil
							</Button>
						</div>

						<h3>Color de piezas</h3>
						<div className="buttons">
							<Button
								type={color === "white" ? "primary" : "default"}
								onClick={() => setColor("white")}
							>
								Blancas
							</Button>
							<Button
								type={color === "black" ? "primary" : "default"}
								onClick={() => setColor("black")}
							>
								Negras
							</Button>
						</div>
					</>
				)}
				{configuration.isNew ? (
					<Button
						className="play-button"
						onClick={() => handlePlay(true)}
					>
						Jugar!
					</Button>
				) : (
					<div className="play-btns">
						<Button
							className="play-button"
							onClick={() => handlePlay(false)}
						>
							Continuar juego
						</Button>
						<Button
							className="play-button"
							onClick={() => handlePlay(true)}
						>
							Nuevo juego
						</Button>
					</div>
				)}
			</div>
		</div>
	);
};

export default Menu;
