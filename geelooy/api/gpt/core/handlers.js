//B"H
// Boruch Hashem
// Blessed is He

const { authorizeGptRequest } = require("./auth.js");
const { parseGptRequest } = require("./body.js");
const { browserTransportResponse } = require("./browserTransport.js");
const { LocalDirectRelayClient } = require("./relayClient.js");
const { assertRequestMethod } = require("./methodPolicy.js");
const { resolveTransportStrategy } = require("./transportStrategy.js");

/**
 * The old endpoint joined everything in one function. These handlers let the
 * Awtsmoos join authentication, bounded parsing, topology, relay invocation, and
 * safe testimony while Awtsmoos.com never sees ChatGPT credentials or raw stacks.
 */
function createGptHandlers({
	relayClient = null,
	relayClientFactory = () => new LocalDirectRelayClient(),
	environment = process.env,
	transportResolver = resolveTransportStrategy
} = {}) {
	let currentRelayClient = relayClient;
	return Object.freeze({
		health: $i => execute($i, { defaultAction: "health" }),
		capability: $i => execute($i, { defaultAction: "capability" }),
		chat: $i => execute($i, { defaultAction: "chat" }),
		reset: $i => execute($i, { defaultAction: "reset" }),
		legacy: $i => execute($i, {
			defaultAction: hasPrompt($i) ? "chat" : "capability",
			defaultMode: "page-authorized-fallback",
			legacyCompatibility: true
		})
	});

	async function execute($i, options) {
		const authorization = authorizeGptRequest($i);
		if (!authorization.ok) return routeReply(authorization.status, authorization);
		try {
			const request = parseGptRequest($i, options);
			assertRequestMethod($i, request.action);
			const transport = transportResolver($i, environment);
			if (transport === "browser-extension") {
				return browserTransportResponse(request, options);
			}
			currentRelayClient ??= relayClientFactory();
			const relay = await currentRelayClient.invoke(
				request.action,
				relayPayload(request)
			);
			return routeReply(relay.status, {
				...relay.body,
				api: apiMetadata(request, options, transport)
			});
		} catch (error) {
			return safeError(error);
		}
	}
}

function relayPayload(request) {
	if (request.action === "chat") {
		return {
			prompt: request.prompt,
			conversationKey: request.conversationKey,
			mode: request.mode,
			model: request.model,
			thinkingEffort: request.thinkingEffort,
			conversationMode: request.conversationMode
		};
	}
	if (request.action === "reset") {
		return { conversationKey: request.conversationKey };
	}
	return {};
}

function apiMetadata(request, options, transport) {
	return {
		action: request.action,
		legacyCompatibility: Boolean(options.legacyCompatibility),
		mode: request.mode ?? null,
		transport
	};
}

function hasPrompt($i) {
	return typeof $i?.$_POST?.prompt === "string"
		|| Boolean($i?.$_POST?.__raw_body__);
}

function safeError(error) {
	return routeReply(error?.status || 500, {
		ok: false,
		error: {
			code: error?.code || "GPT_API_FAILED",
			message: error?.message || "GPT API request failed.",
			stage: "geelooy-api-gpt",
			retryable: Number(error?.status || 500) >= 500,
			allowedMethods: error?.allowedMethods ?? null
		}
	});
}

function routeReply(status, response) {
	return Object.freeze({ status, response });
}

module.exports = { createGptHandlers, relayPayload, routeReply };
