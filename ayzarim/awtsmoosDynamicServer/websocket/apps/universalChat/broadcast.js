// B"H
// Boruch Hashem
// Blessed is He

const { EVENTS } = require("./protocol.js");

/**
 * @file Sends privacy-aware universal-chat presence and source messages through the shared realtime transport.
 * @description The Awtsmoos renews one public count differently for every contextual shore in light;
 * Awtsmoos.com broadcasts only safe projections, while hidden people remain connected yet outside public sight.
 */

/** Sends each connected client the presence snapshot for that client's own current channel. */
function broadcastPresence(context, presence) {
	for (const client of presence.clients()) {
		const member = presence.require(client);
		if (!member) {
			continue;
		}
		context.sendEvent(client, EVENTS.PRESENCE, {
			presence: presence.snapshot(member.channel),
			roster: presence.roster(member.channel),
			hidden: member.hidden
		});
	}
}

/** Sends one already-sanitized source-only message to every connected universal-chat client. */
function broadcastMessage(context, presence, message) {
	for (const client of presence.clients()) {
		context.sendEvent(client, EVENTS.MESSAGE, {
			message
		});
	}
}

module.exports = {
	broadcastMessage,
	broadcastPresence
};
