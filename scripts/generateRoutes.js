// generateRoutes.js
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pagesDir = path.resolve(__dirname, "../src/pages");
const routesConfigPath = path.join(__dirname, "../src/routesConfig.tsx");

function getFiles(dir, baseDir = dir, fileList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      getFiles(filePath, baseDir, fileList);
    } else if (file.endsWith(".tsx")) {
      const relativePath = path.relative(baseDir, filePath);
      fileList.push(relativePath);
    }
  }
  return fileList;
}

function generateUniqueComponentName(filePath) {
  const componentName = path.basename(path.dirname(filePath));
  const fileName = path.basename(filePath, ".tsx");
  const uniqueIdentifier = fileName
    .replace(/[^a-zA-Z0-9]/g, "") // Remove non-alphanumeric characters
    .replace(/^(\d+)/, "_$1"); // Add underscore if the name starts with a number
  const [firstWord, ...otherWords] = uniqueIdentifier.split(/(?=[A-Z])/); // Split camelCase into words
  const capitalizedComponentName =
    componentName.charAt(0).toUpperCase() + componentName.slice(1);
  const capitalizedWords = [capitalizedComponentName, firstWord, ...otherWords];
  return capitalizedWords.join("_");
}

function createRouteDefinitions(files) {
  const routeDefinitions = [];

  // Check if there is a root index file
  const rootIndexFile = files.find((file) => file === "index.tsx");
  if (rootIndexFile) {
    routeDefinitions.push({
      path: "/",
      component: "Root",
      importPath: "./pages/index",
    });
  }

  for (const filePath of files) {
    if (filePath === "index.tsx") continue; // Skip the root index file

    const routePath = filePath
      .replace(/\/index\.tsx$/, "") // Remove 'index.tsx' for default routes
      .replace(/\.tsx$/, "") // Remove file extension for the route path
      .replace(/\[([^\]]+)\]/g, ":$1"); // Convert [param] to :param for dynamic routes

    const componentName = generateUniqueComponentName(filePath);
    const importPath = `./pages/${filePath.replace(/\.tsx$/, "")}`;

    routeDefinitions.push({
      path: `/${routePath}`,
      component: componentName,
      importPath: importPath,
    });
  }

  return routeDefinitions;
}

function generateRoutes() {
  const files = getFiles(pagesDir);
  const routeDefinitions = createRouteDefinitions(files);
  const imports = routeDefinitions
    .map((route) => `import ${route.component} from '${route.importPath}';`)
    .join("\n");
  const routeConfig = routeDefinitions
    .map(
      (route) =>
        `<Route key="${route.component}" path="${route.path}" element={<${route.component} />} />,`,
    )
    .join("\n");

  const routesConfigContent = `
    import { Route } from 'react-router-dom';
    ${imports}
    export const routes = [
        ${routeConfig}
    ];
  `;
  fs.writeFileSync(routesConfigPath, routesConfigContent, "utf8");
  console.log("Route configuration generated successfully.");
}

generateRoutes();
