import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { TableOrdersProvider } from "@/context/TableOrdersContext";
import "./index.css";

createRoot(document.getElementById("root")!).render(
	<TableOrdersProvider>
		<App />
	</TableOrdersProvider>
);
