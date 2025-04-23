import React from "react";
import { Button, message } from "antd";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./menu.css";

//TODO: Agregar jugar al dar click a Enter
const Menu = () => {
	const [gameType, setGameType] = useState("two-players");
	const [difficulty, setDifficulty] = useState("facil");
	const [player1, setPlayer1] = useState("");
	const [player2, setPlayer2] = useState("");
	const [color, setColor] = useState("white");
	const navigate = useNavigate();
	const [messageApi, contextHolder] = message.useMessage();

	const handlePlay = () => {
		if (gameType === "two-players" && (!player1 || !player2)) {
			messageApi.open({
				type: "error",
				content: "Por favor ingresa el nombre de ambos jugadores",
			});
			return;
		} else if (gameType === "ai" && !player1) {
			messageApi.open({
				type: "error",
				content: "Por favor ingresa el nombre del jugador",
			});
			return;
		} else {
			navigate(
				`/game/${gameType}_${color}/${player1}/${
					gameType === "two-players" ? player2 : "default"
				}/${gameType === "two-players" ? "default" : difficulty}`
			);
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
						onClick={() => setGameType("two-players")}
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
				<Button className="play-button" onClick={handlePlay}>
					Jugar!
				</Button>
			</div>
		</div>
	);
};

export default Menu;
