import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { CssBaseline } from "@mui/material";
import App from "./App.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <CssBaseline />
    <App />
  </StrictMode>,
);

//createRoot to mount the React application to the DOM element with the id "root"
//<StrictMode> is a wrapper component that helps identify potential problems in the application during development

//CssBaseline: MUI component that resets inconsistent browser default styles (margins, fonts) for a clean baseline
//! after getElementById("root") is TypeScript's non-null assertion —  as if it's telling typescript this "trust me, this element exists."
