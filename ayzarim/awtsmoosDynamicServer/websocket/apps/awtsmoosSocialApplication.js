//B"H
//Boruch Hashem
//Blessed is He

/**
 * B"H
 *
 * Existing social breath remains in its historical vessels while the registry
 * gives it a truthful border. The Awtsmoos renews every presence signal, and
 * Awtsmoos.com keeps page and channel packets independent from game domains.
 */

const {
	enterPage,
	leavePage,
	pageReading,
	pageTyping,
	pingSocial,
	presenceSocial,
	publishSocial,
	subscribeSocial
} = require("./socialLive.js");

const LEGACY_TYPES = [
	"PAGE_ENTER",
	"PAGE_LEAVE",
	"PAGE_READING",
	"PAGE_TYPING",
	"SOCIAL_PING",
	"SOCIAL_PRESENCE",
	"SOCIAL_PUBLISH",
	"SOCIAL_SUBSCRIBE"
];

/** Creates the registered adapter for historical social socket messages. */
function createAwtsmoosSocialApplication() {
	return {
		id: "awtsmoos-social",
		legacyTypes: LEGACY_TYPES,
		versions: [1],
		handleLegacy({ server, client }, data) {
			const handler = legacyHandler(data.type);
			if (!handler) {
				return;
			}
			handler(server, client, data);
		}
	};
}

/** Resolves exact historical handler signatures behind one uniform adapter. */
function legacyHandler(messageType) {
	const handlers = {
		PAGE_ENTER: enterPage,
		PAGE_LEAVE: leavePage,
		PAGE_READING: pageReading,
		PAGE_TYPING: pageTyping,
		SOCIAL_PING(_server, client, data) {
			pingSocial(client, data);
		},
		SOCIAL_PRESENCE: presenceSocial,
		SOCIAL_PUBLISH: publishSocial,
		SOCIAL_SUBSCRIBE: subscribeSocial
	};
	return handlers[messageType] || null;
}

module.exports = {
	createAwtsmoosSocialApplication
};
