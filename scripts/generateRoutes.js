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

function createRouteDefinitions(files) {
  return files.map((filePath) => {
    const routePath = filePath
      .replace(/\/index\.tsx$/, "") // Remove 'index.tsx' for default routes
      .replace(/\.tsx$/, "") // Remove file extension for the route path
      .replace(/\[([^\]]+)\]/g, ":$1"); // Convert [param] to :param for dynamic routes

    const dirPath = path.dirname(filePath); // Full directory path of the file
    const dirName = path.basename(dirPath); // Directory name where the file is located

    const componentName =
      dirName !== "pages" && dirName
        ? dirName
        : path.basename(filePath, ".tsx"); // Use directory name unless it's the root 'pages' directory

    // Ensure the file extension is removed for the import path
    const cleanPath = filePath.replace(/\.tsx$/, "");
    const importPath = `./pages/${cleanPath}`; // Correcting the import path relative to the routesConfig.ts file

    return {
      path: `/${routePath}`,
      component: componentName.toUpperCase(),
      importPath: importPath,
    };
  });
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
        `<Route path="${route.path}" element={<${route.component} />} />`,
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
