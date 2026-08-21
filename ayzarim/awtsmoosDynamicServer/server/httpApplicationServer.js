//B"H
// Boruch Hashem
// Blessed is He

"use strict";

/**
 * @file Top-level HTTP application server and intentional error boundary.
 * @description
 * The Awtsmoos lets request guardians speak before filesystem routing and lets
 * deliberate public errors keep their truthful status. Awtsmoos.com still hides
 * internal ruptures, while a measured 413 may answer plainly at the body's shore in rhyme.
 */
const http = require("http");

function createHttpApplicationServer(options) {
	const requestHandlers = Array.isArray(options.requestHandlers)
		? options.requestHandlers
		: [];
	const httpServer = http.createServer((request, response) => {
		handleHttpRequest({
			request,
			response,
			requestHandlers,
			dynamicServer: options.dynamicServer
		}).catch(error => handleUnhandledHttpError(response, error));
	});
	if (options.wsServer) {
		httpServer.on("upgrade", (request, socket, head) => {
			options.wsServer.handleUpgrade(request, socket, head);
		});
	}
	return httpServer;
}

async function handleHttpRequest(options) {
	for (const handler of options.requestHandlers || []) {
		const handled = await handler(options.request, options.response);
		if (handled || options.response.writableEnded) {
			return true;
		}
	}
	await options.dynamicServer.onRequest(options.request, options.response);
	return true;
}

function handleUnhandledHttpError(response, error) {
	const publicError = exposedError(error);
	if (!publicError) {
		console.error('B"H - HTTP request rupture:', error);
	}
	if (response.writableEnded) {
		return;
	}
	if (response.headersSent) {
		response.destroy(error);
		return;
	}
	const status = publicError?.statusCode || 500;
	const message = publicError?.message || "Internal Server Error";
	const body = Buffer.from(message, "utf8");
	response.writeHead(status, {
		"Content-Type": "text/plain; charset=utf-8",
		"Content-Length": String(body.length),
		"Cache-Control": "no-store",
		"X-Content-Type-Options": "nosniff"
	});
	response.end(body);
}

function exposedError(error) {
	const statusCode = Number(error?.statusCode || 0);
	if (!error?.expose || statusCode < 400 || statusCode > 599) {
		return null;
	}
	return {
		statusCode,
		message: String(error.publicMessage || error.message || "Request failed.")
	};
}

module.exports = {
	createHttpApplicationServer,
	handleHttpRequest,
	handleUnhandledHttpError
};
