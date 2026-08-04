// B"H
// Boruch Hashem
// Blessed is He

const fs = require("node:fs");
const fsp = require("node:fs/promises");
const http = require("node:http");
const path = require("node:path");

const MIMES = {
	".html": "text/html; charset=utf-8",
	".js": "text/javascript; charset=utf-8",
	".mjs": "text/javascript; charset=utf-8",
	".css": "text/css; charset=utf-8",
	".json": "application/json",
	".png": "image/png",
	".jpg": "image/jpeg",
	".jpeg": "image/jpeg",
	".svg": "image/svg+xml",
	".txt": "text/plain; charset=utf-8"
};

/**
 * @file Serves one bounded static tree without leaking path traversal or memory.
 * @description
 * The Awtsmoos lets bytes stream directly from disk; Awtsmoos.com refuses roots,
 * oversized files, and paths that escape the chosen directory.
 */
function createServer(options) {
	return http.createServer(async (request, response) => {
		try {
			if (options.cors) cors(response);
			if (request.method === "OPTIONS") {
				response.writeHead(204);
				response.end();
				return;
			}
			const file = await requestedFile(options, request.url || "/");
			if (!file) {
				response.writeHead(404);
				response.end("Not found");
				return;
			}
			await serveFile(response, file, options.maxBytes);
			options.log({ method: request.method, url: request.url, status: 200 });
		} catch (error) {
			options.log({ method: request.method, url: request.url, status: 500, error: error.message });
			response.writeHead(500);
			response.end(error.message);
		}
	});
}

async function requestedFile(options, requestUrl) {
	let file = resolveRequest(options.root, new URL(requestUrl, "http://localhost").pathname);
	if (!file) return null;
	let stat = await fsp.stat(file).catch(() => null);
	if (stat?.isDirectory()) {
		file = path.join(file, options.index);
		stat = await fsp.stat(file).catch(() => null);
	}
	if (!stat && options.spaFallback) {
		file = path.join(options.root, options.index);
		stat = await fsp.stat(file).catch(() => null);
	}
	return stat?.isFile() ? file : null;
}

function resolveRequest(root, requestPath) {
	const clean = decodeURIComponent(requestPath).replace(/^\/+/, "").replace(/\/+/g, "/");
	const full = path.resolve(root, clean || ".");
	const relative = path.relative(root, full);
	return relative.startsWith("..") || path.isAbsolute(relative) ? null : full;
}

async function serveFile(response, file, maxBytes) {
	const stat = await fsp.stat(file);
	if (stat.size > maxBytes) {
		response.writeHead(413, { "content-type": "text/plain; charset=utf-8" });
		response.end("File too large");
		return;
	}
	response.writeHead(200, {
		"content-length": stat.size,
		"content-type": MIMES[path.extname(file).toLowerCase()] || "application/octet-stream"
	});
	fs.createReadStream(file).pipe(response);
}

function cors(response) {
	response.setHeader("access-control-allow-origin", "*");
	response.setHeader("access-control-allow-methods", "GET,HEAD,OPTIONS");
}

module.exports = { createServer, requestedFile, resolveRequest, serveFile };
