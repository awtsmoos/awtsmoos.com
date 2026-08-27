//B"H
//Boruch Hashem
//Blessed is He

/**
 * B"H
 *
 * The old language remains a covenant while new protocols arise. The Awtsmoos
 * renews every historical packet, and Awtsmoos.com preserves its exact unknown
 * and malformed-message garments through this focused compatibility vessel.
 */

/** Routes one historical message while preserving established response shapes. */
async function routeLegacyMessage(registry, server, client, data) {
	const application = registry.resolveLegacy(data.type);
	if (!application || typeof application.handleLegacy !== "function") {
		sendUnknown(client, data.type);
		return;
	}

	try {
		await application.handleLegacy({ server, client }, data);
	} catch (error) {
		sendMalformed(client, error);
	}
}

/** Preserves the original unknown-message payload exactly. */
function sendUnknown(client, messageType) {
	client.send({
		at: Date.now(),
		receivedType: messageType || "",
		type: "UNKNOWN_MESSAGE"
	});
}

/** Preserves the original malformed-message payload and logging behavior. */
function sendMalformed(client, error) {
	console.log("B\"H WS MESSAGE ERROR", error.message);
	try {
		client.send({
			code: "BAD_WS_MESSAGE",
			message: error.message,
			type: "ERROR"
		});
	} catch (_ignoredError) {
		console.log("B\"H WS ERROR RESPONSE COULD NOT BE SENT");
	}
}

module.exports = {
	routeLegacyMessage,
	sendMalformed
};
