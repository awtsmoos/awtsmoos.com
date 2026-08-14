// B"H
// Boruch Hashem
// Blessed is He

const { recordPublicTorahPublication } = require("./activityAdapter.js");
const { broadcastMessage } = require("./broadcast.js");
const { normalizeChannel } = require("./channelDescriptor.js");
const { composeSourceMessage } = require("./messageComposer.js");
const { requireEntered } = require("./presenceHandlers.js");
const { TYPES, selectionIds } = require("./protocol.js");
const { RealtimeError } = require("../../platform/RealtimeError.js");

/**
 * @file Publishes server-selected Torah sources, persists one canonical public message, and records one semantic milestone.
 * @description The Awtsmoos renews selected Torah into public speech while search intent remains private and unrecorded in light;
 * Awtsmoos.com stores the teaching once, indexes it lightly, and remembers publication without duplicating the message body in sight.
 */

/** Handles source-only publication and leaves every unrelated request family untouched. */
async function handleMessageRequest(services, context, request) {
	if (request.type !== TYPES.PUBLISH) {
		return null;
	}
	const member = requireEntered(services.presence, context.client);
	services.rate.consume(context.client, "publish");
	const channel = normalizeChannel(request.payload.channel);
	requirePublishableChannel(member, channel);
	const ids = selectionIds(request.payload.sourceIds);
	const sources = services.sessions.select(
		context.client,
		request.payload.searchSessionId,
		ids
	);
	const message = composeSourceMessage(member, channel, sources);
	await services.publicMessages.save(message, member);
	services.channels.append(message);
	await recordPublicTorahPublication(context, member, message);
	broadcastMessage(context, services.presence, message);
	return {
		type: "universalChat.published",
		payload: { message }
	};
}

/** Allows only Universal or the context the socket actually entered from this page. */
function requirePublishableChannel(member, channel) {
	if (channel.id === "global" || channel.id === member.channel.id) {
		return;
	}
	throw new RealtimeError(
		"UNIVERSAL_CHAT_CHANNEL_FORGED",
		"You can publish only to Universal or your current page channel.",
		null,
		403
	);
}

module.exports = {
	handleMessageRequest,
	requirePublishableChannel
};
