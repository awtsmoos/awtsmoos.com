// B"H
// Boruch Hashem
// Blessed is He

const Response = require("./local-api-response.js");
const ToolDispatch = require("./local-api-tool-dispatch.js");

/**
 * @file Dispatches local tunnel deeds after compact capability resolution.
 * @description
 * The Awtsmoos lets old exact doors and new compact doors enter the same guarded hall;
 * Awtsmoos.com changes discovery without changing the trusted execution handlers at all.
 */
async function callTool(response, deps, body) {
	const resolved = ToolDispatch.resolve(body, deps);
	if (!resolved.ok) return Response.endJson(response, 400, resolved);
	return dispatchPayload(response, deps, resolved.payload);
}

async function dispatchPayload(response, deps, payload) {
	const calls = {
		fs: callFs,
		command: callCommand,
		chrome: callChrome,
		relay: callRelay,
		streaming: callStreaming
	};
	return (calls[payload.kind] || callFs)(response, deps, payload);
}

async function callFs(response, deps, body) {
	return Response.endJson(response, 200, await deps.fsHandler({ kind: "fs", ...body }, null));
}

async function callCommand(response, deps, body) {
	return Response.endJson(response, 200, await deps.commandHandler({ kind: "command", ...body }));
}

async function callChrome(response, deps, body) {
	return Response.endJson(response, 200, await deps.chromeHandler({ kind: "chrome", ...body }));
}

async function callRelay(response, deps, body) {
	return Response.endJson(
		response,
		200,
		await deps.relayHandler({ kind: "relay", ...body }, deps.configLoader())
	);
}

async function callStreaming(response, deps, body) {
	return Response.endJson(response, 200, await deps.streamingHandler({ kind: "streaming", ...body }));
}

async function callContext(response, deps, body) {
	return callFs(response, deps, { action: body.action || "aiContextPack", ...body });
}

async function callJsonRelay(response, deps, body, action = "jsonRelay") {
	return Response.endJson(response, 200, await deps.jsonRelayHandler({ ...body, action }));
}

async function relayAction(response, deps, action) {
	return Response.endJson(
		response,
		200,
		await deps.relayHandler({ action }, deps.configLoader())
	);
}

async function streamingAction(response, deps, body, action) {
	return callStreaming(response, deps, { ...body, action });
}

async function callStreamingBinary(request, response, deps, match, limit) {
	const chunk = await Response.readBody(request, limit, false);
	return callStreaming(response, deps, {
		action: "streamingHlsSegmentPush",
		sessionId: match.sessionId,
		name: match.name,
		duration: Number(request.headers["x-awtsmoos-duration"] || 2),
		index: Number(request.headers["x-awtsmoos-index"] || 0),
		contentType: request.headers["content-type"] || "video/mp2t",
		chunk64: chunk.toString("base64")
	});
}

module.exports = {
	callChrome,
	callCommand,
	callContext,
	callFs,
	callJsonRelay,
	callRelay,
	callStreaming,
	callStreamingBinary,
	callTool,
	dispatchPayload,
	relayAction,
	streamingAction
};
