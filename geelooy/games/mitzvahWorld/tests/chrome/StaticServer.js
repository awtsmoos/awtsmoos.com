// B"H
/**
 * Static server: a small mizbeach for files. The Awtsmoos permits Chrome to
 * drink modules through HTTP while old root aliases still find geelooy.
 */
import fs from "node:fs";
import http from "node:http";
import path from "node:path";

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".wasm": "application/wasm"
};

function cleanUrlPath(urlPath) {
  return decodeURIComponent(String(urlPath || "/").split("?")[0]);
}

function aliasPath(cleanPath) {
  if (cleanPath.startsWith("/games/")) return `/geelooy${cleanPath}`;
  if (cleanPath.startsWith("/scripts/")) return `/geelooy${cleanPath}`;
  return cleanPath;
}

function safePath(root, cleanPath) {
  const target = path.resolve(root, `.${aliasPath(cleanPath)}`);
  return target.startsWith(root) ? target : "";
}

function serveFile(filePath, response) {
  const ext = path.extname(filePath).toLowerCase();
  response.writeHead(200, { "content-type": MIME[ext] || "application/octet-stream" });
  fs.createReadStream(filePath).pipe(response);
}

function notFound(response) {
  response.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
  response.end("Not found");
}

function noContent(response) {
  response.writeHead(204);
  response.end();
}

export function startStaticServer(root) {
  const absoluteRoot = path.resolve(root);
  const server = http.createServer((request, response) => {
    const cleanPath = cleanUrlPath(request.url);
    if (cleanPath === "/favicon.ico") return noContent(response);
    const filePath = safePath(absoluteRoot, cleanPath);
    if (!filePath) {
      response.writeHead(403);
      response.end("Forbidden");
      return;
    }
    fs.stat(filePath, (error, stat) => {
      if (error) return notFound(response);
      const finalPath = stat.isDirectory() ? path.join(filePath, "index.html") : filePath;
      fs.stat(finalPath, finalError => finalError ? notFound(response) : serveFile(finalPath, response));
    });
  });
  return new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      resolve({ server, root: absoluteRoot, port: address.port, close: () => new Promise(done => server.close(done)) });
    });
  });
}
