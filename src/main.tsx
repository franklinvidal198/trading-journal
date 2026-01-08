// Polyfill crypto for Node.js environment before anything else
import 'isomorphic-webcrypto';

import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

const rootElement = document.getElementById("root");
if (!rootElement) {
  console.error("Root element not found!");
  document.body.innerHTML = "<h1>Error: Root element not found</h1>";
} else {
  console.log("Root element found, rendering App");
  createRoot(rootElement).render(<App />);
}
