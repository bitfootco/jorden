// routes.plugin.js
import { execSync } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const generateRoutesScript = path.resolve(
  __dirname,
  "../scripts/generateRoutes.js",
);

function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      func(...args);
    }, wait);
  };
}

function runGenerateRoutes() {
  try {
    execSync(`node ${generateRoutesScript}`, { stdio: "inherit" });
    console.log("Routes have been successfully generated.");
  } catch (error) {
    console.error("Failed to regenerate routes:", error);
  }
}

const debouncedRunGenerateRoutes = debounce(runGenerateRoutes, 300);

export default function generateRoutesPlugin() {
  return {
    name: "generate-routes",
    buildStart() {
      runGenerateRoutes(); // Run on build start
    },
    handleHotUpdate({ server }) {
      debouncedRunGenerateRoutes();
      server.ws.send({ type: "full-reload", path: "*" });
    },
  };
}
