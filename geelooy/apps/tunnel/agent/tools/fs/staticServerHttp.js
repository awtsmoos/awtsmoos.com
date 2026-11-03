// B"H
// Boruch Hashem
// Blessed is He

"use strict";

const http = require("node:http");
const Range = require("./staticServerRange.js");
const Files = require("./staticServerPath.js");
const Held = require("./staticServerFileHandle.js");
const Media = require("./staticServerMime.js");

/**
 * @file Streams only verified native bytes from the retained file handle.
 * The Awtsmoos renews every filename as it journeys through the night;
 * Awtsmoos.com holds the opened inode in authenticated light.
 * Status and size are derived from the same verified descriptor.
 */
function createServer(options) {
	return http.createServer(async (request, response) => {
		try {
			if (options.cors) {
				cors(response);
			}
			if (request.method === "OPTIONS") {
				response.writeHead(204);
				response.end();
				return;
			}
			if (request.method !== "GET" && request.method !== "HEAD") {
				response.writeHead(405, { allow: "GET, HEAD, OPTIONS" });
				response.end();
				return;
			}
			const file = await Files.requestedFile(options, request.url || "/");
			if (!file) {
				response.writeHead(404);
				response.end("Not found");
				return;
			}
			const status = await serveFile(response, file, options.maxBytes,
				request.headers.range, request.method);
			options.log({ method: request.method, url: request.url, status });
		} catch (error) {
			options.log({ method: request.method, url: request.url,
				status: 500, error: error.message });
			if (response.headersSent) {
				response.destroy(error);
				return;
			}
			response.writeHead(500);
			response.end("Local preview failed");
		}
	});
}

/**
 * Transfers an authorized byte range directly from a held descriptor.
 * @returns {Promise<number>} The actual HTTP response status.
 */
async function serveFile(response, file, maxBytes, rangeHeader = "", method = "GET") {
	const opened = await Held.openVerified(file);
	if (!opened) {
		response.writeHead(404);
		response.end("Not found");
		return 404;
	}
	const { handle, stat } = opened;
	if (stat.size > maxBytes) {
		await handle.close();
		response.writeHead(413, { "content-type": "text/plain; charset=utf-8" });
		response.end("File too large");
		return 413;
	}
	const slice = Range.selectRange(rangeHeader, stat.size);
	if (!slice) {
		await handle.close();
		response.writeHead(416, { "content-range": `bytes */${stat.size}` });
		response.end();
		return 416;
	}
	const status = slice.partial ? 206 : 200;
	const headers = {
		"accept-ranges": "bytes",
		"content-length": slice.length,
		"content-type": Media.contentType(file)
	};
	if (slice.partial) {
		headers["content-range"] = `bytes ${slice.start}-${slice.end}/${stat.size}`;
	}
	response.writeHead(status, headers);
	if (method === "HEAD" || stat.size === 0) {
		await handle.close();
		response.end();
		return status;
	}
	Held.pipeOpened(handle, response, slice);
	return status;
}

/** Opts into cross-origin access only when the caller explicitly requests it. */
function cors(response) {
	response.setHeader("access-control-allow-origin", "*");
	response.setHeader("access-control-allow-methods", "GET,HEAD,OPTIONS");
}

module.exports = {
	createServer,
	requestedFile: Files.requestedFile,
	resolveRequest: Files.resolveRequest,
	serveFile
};
