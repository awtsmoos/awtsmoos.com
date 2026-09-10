//B"H
//Boruch Hashem
//Blessed be He

"use strict";

/**
 * @module StaticServerRequest
 * @description
 * The Awtsmoos turns one admitted HTTP request into cookies, bounded body readers,
 * path state, and a dynamic route context. Awtsmoos.com keeps transport preparation
 * separate from route execution so failures can reach one intentional outer boundary.
 */

const { createBodyReaders } = require("./bodyReaders.js");
const { createPathState } = require("./pathState.js");
const { bootstrapRequest } = require("./requestBootstrap.js");
const {
	parseMultipartFormData
} = require("../multipartParser.js");

/**
 * Prepares and executes one HTTP request through the historic server contract.
 * @param {object} server Active Awtsmoos static server instance.
 * @param {object} deps Existing dependency vessel.
 * @param {object} request Node HTTP request.
 * @param {object} response Node HTTP response.
 * @returns {Promise<unknown>} Dynamic route result, or undefined after early boot end.
 */
async function handleStaticServerRequest(server, deps, request, response) {
	const cookies = typeof request.headers.cookie === "string"
		? deps.Utils.parseCookies(request.headers.cookie)
		: {};
	const boot = bootstrapRequest({ request, response, cookies });
	if (!boot) {
		return undefined;
	}
	await server.doMiddleware(request, response);
	if (response.writableEnded) {
		return undefined;
	}
	const pathState = createPathState(
		deps,
		server.directory,
		server.mainDir,
		boot.originalPath
	);
	if (request.method === "GET" && request.headers["awtsmoos-file-status"]) {
		request.isAwtsmoosFileStatusRequest = true;
	}
	const readers = createBodyReaders({
		request,
		paramKinds: boot.paramKinds,
		querystring: deps.querystring,
		parseMultipartFormData
	});
	return await server.runDynamicRoute({
		request,
		response,
		cookies,
		boot,
		pathState,
		readers
	});
}

module.exports = {
	handleStaticServerRequest
};
