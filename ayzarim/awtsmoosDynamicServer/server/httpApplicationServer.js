//B"H
// Boruch Hashem
// Blessed is He

"use strict";

/**
 * @file Top-level HTTP application server and intentional error boundary.
 * @description
 * The Awtsmoos lets canonical doorways and request guardians speak before filesystem routing;
 * Awtsmoos.com keeps public errors truthful while hidden ruptures remain veiled in proper clothing.
 */
const http = require("http");
const { applyHttpTransportPolicy } = require("./httpTransportPolicy.js");
const { handlePublicShaarRequest } = require("./publicRouteIngress.js");

function createHttpApplicationServer(options) {
	const requestHandlers = createRequestHandlers(options.requestHandlers);
	const httpServer = http.createServer((request, response) => {
		handleHttpRequest({
			request,
			response,
			requestHandlers,
			dynamicServer: options.dynamicServer
		}).catch(error => handleUnhandledHttpError(response, error));
	});
	applyHttpTransportPolicy(httpServer, options.environment || process.env);
	if (options.wsServer) {
		httpServer.on("upgrade", (request, socket, head) => {
			options.wsServer.handleUpgrade(request, socket, head);
		});
	}
	return httpServer;
}

/**
 * Places the canonical sha'ar before optional application-specific guardians.
 *
 * @param {Function[]|undefined} handlers
 * 	Optional request handlers supplied by the application bootstrap.
 * @returns {Function[]}
 * 	Ordered request guardians.
 */
function createRequestHandlers(handlers) {
	const applicationHandlers = Array.isArray(handlers) ? handlers : [];
	return [handlePublicShaarRequest, ...applicationHandlers];
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
	createRequestHandlers,
	handleHttpRequest,
	handleUnhandledHttpError
};
