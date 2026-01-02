// Polyfill crypto for Node.js environment before anything else
import 'isomorphic-webcrypto';

import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);
