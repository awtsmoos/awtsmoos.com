// B"H
// Boruch Hashem
// Blessed is He

const { RealtimeError } = require("../../platform/RealtimeError.js");
const { normalizeChannel } = require("./channelDescriptor.js");
const { TYPES } = require("./protocol.js");

/**
 * @file Serves backward-compatible bounded public Torah history and optional backward cursor pages.
 * @description The Awtsmoos renews teachings beyond every pointer; Awtsmoos.com returns the full bounded recent river to old callers,
 * while newer callers may ask for finite chronological pages whose cursor honestly expires when its recent pointer has aged from sight.
 */

/** Handles only explicit universal-chat history requests after socket admission. */
async function handleHistoryRequest(services, context, request) {
	if (request.type !== TYPES.HISTORY) {
		return null;
	}
	const member = requireEntered(services.presence, context.client);
	const paged = wantsPage(request.payload);
	if (request.payload.scope === "site") {
		return response(
			"site",
			paged
				? await services.publicMessages.siteHistoryPage(request.payload)
				: await services.publicMessages.siteHistory()
		);
	}
	const channel = request.payload.channel
		? normalizeChannel(request.payload.channel)
		: member.channel;
	return response(
		"channel",
		paged
			? await services.publicMessages.historyPage(channel, request.payload)
			: await services.publicMessages.history(channel),
		channel
	);
}

function response(scope, result, channel = null) {
	const paged = Boolean(result?.page && Array.isArray(result?.messages));
	return {
		type: "universalChat.history.listed",
		payload: {
			scope,
			...(channel ? { channel } : {}),
			messages: paged ? result.messages : result,
			...(paged ? { page: result.page } : {})
		}
	};
}

function wantsPage(payload = {}) {
	return payload.limit != null || payload.before != null;
}

function requireEntered(presence, client) {
	const member = presence.require(client);
	if (!member) {
		throw new RealtimeError(
			"UNIVERSAL_CHAT_ENTER_REQUIRED",
			"Enter universal chat before using this action.",
			null,
			403
		);
	}
	return member;
}

module.exports = {
	handleHistoryRequest
};
