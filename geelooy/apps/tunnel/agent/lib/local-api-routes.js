// B"H
// Boruch Hashem
// Blessed is He

const Actions = require("./local-api-actions.js");
const Handlers = require("./local-api-route-handlers.js");
const Health = require("./local-api-health.js");
const Limits = require("./local-api-limits.js");
const Response = require("./local-api-response.js");

/**
 * @file Routes local tunnel HTTP requests through compact discovery and exact execution.
 * @description
 * The Awtsmoos lets each doorway reveal one clear task while deeper deeds remain whole;
 * Awtsmoos.com separates health, transport, and action vessels so no crowded file hides the soul.
 */
async function get(response, deps, url) {
	const routes = {
		"/health": Health.health,
		"/healthz": Health.healthz,
		"/actions": Health.catalog,
		"/tools": Health.catalog,
		"/schemas": Health.catalog,
		"/manifest": Health.catalog,
		"/relay/health": Handlers.relayHealth,
		"/relay/open-login": Handlers.relayOpenLogin,
		"/relay/cookies": Handlers.relayCookies,
		"/streaming": Handlers.streamingStatus,
		"/streaming/status": Handlers.streamingStatus
	};
	const handler = routes[url.pathname];
	return handler
		? handler(response, deps, url)
		: Response.endJson(response, 404, {
			ok: false,
			error: "unknown_local_api_route"
		});
}

async function post(request, response, deps, url) {
	const binary = Response.binaryHlsMatch(url.pathname);
	if (binary) {
		return Actions.callStreamingBinary(
			request,
			response,
			deps,
			binary,
			Limits.BINARY_LIMIT
		);
	}
	const body = await Response.readBody(
		request,
		Limits.BODY_LIMIT,
		true
	);
	const handler = postRoutes()[url.pathname] || Actions.callTool;
	return handler(response, deps, body);
}

function postRoutes() {
	return {
		"/fs": Actions.callFs,
		"/command": Actions.callCommand,
		"/chrome": Actions.callChrome,
		"/tool": Actions.callTool,
		"/context": Actions.callContext,
		"/relay": Actions.callRelay,
		"/relay/fetch": Handlers.relayFetch,
		"/relay/body": Handlers.relayBody,
		"/relay/json": Handlers.jsonRelay,
		"/json-relay": Handlers.jsonRelay,
		"/jason/relay": Handlers.jasonRelay,
		"/streaming": Actions.callStreaming,
		"/streaming/start": Handlers.streamingStart,
		"/streaming/chunk": Handlers.streamingChunk,
		"/streaming/stop": Handlers.streamingStop,
		"/streaming/status": Handlers.streamingStatusPost
	};
}

module.exports = {
	BINARY_LIMIT: Limits.BINARY_LIMIT,
	BODY_LIMIT: Limits.BODY_LIMIT,
	catalog: Health.catalog,
	get,
	health: Health.health,
	healthSummary: Health.healthSummary,
	post,
	summaryRequested: Health.summaryRequested
};
