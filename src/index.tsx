import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./_app";

const rootElement = document.getElementById("root");

// New as of React v18.x
const root = createRoot(rootElement!);

root.render(
  <StrictMode>
    <App />
  </StrictMode>,
);
