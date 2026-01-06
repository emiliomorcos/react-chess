import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";

// TODO: DESCOMENTAR STRICT MODE EN PRODUCCIÓN

createRoot(document.getElementById("root")).render(
	// <StrictMode>
	<App />
	// </StrictMode>
);
