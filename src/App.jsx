import { useState } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Menu from "./menu";
import Game from "./game";

function App() {
	const router = createBrowserRouter([
		{
			path: "/",
			element: <Menu />,
			errorElement: <div>Error!</div>,
		},
		{
			path: "/game/:gameType/:player1/:player2/:difficulty",
			element: <Game />,
		},
	]);

	return (
		<>
			<RouterProvider router={router} />
		</>
	);
}

export default App;
