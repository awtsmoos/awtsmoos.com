// B"H
// Boruch Hashem
// Blessed is He

const {
	createRequest,
	resolveRequest
} = require("./testActions.js");
const {
	request
} = require("./testSupport.js");

/**
 * @file Provides reusable private voice-attachment test actions while assertions remain in focused contracts.
 * @description The Awtsmoos renews room, manifest, request, and witness from nothing in every instant; Awtsmoos.com lets this Yesod-like support carry exact setup between tests without swallowing the law each witness must illuminate.
 */

/**
 * Creates one accepted direct conversation between Aleph and Bet.
 * @param {object} app Private messaging application under test.
 * @param {object} contexts Verified alias contexts.
 * @returns {Promise<string>} Accepted conversation id.
 */
async function createAcceptedVoiceRoom(app, contexts) {
	const created = await createRequest(
		app,
		contexts.Aleph,
		"chat",
		"Bet"
	);
	const accepted = await resolveRequest(
		app,
		contexts.Bet,
		created.payload.request.id
	);
	return accepted.payload.conversationId;
}

/**
 * Sends one private-message payload through the real versioned application boundary.
 * @param {object} app Private messaging application under test.
 * @param {object} context Verified sender context.
 * @param {string} conversationId Accepted room id.
 * @param {string} text Optional textual content.
 * @param {object|null} attachment Optional client attachment coordinate.
 * @param {object|null} reply Optional source message used for reply coordinates.
 * @returns {Promise<object>} Application response.
 */
function sendVoiceTestMessage(
	app,
	context,
	conversationId,
	text,
	attachment = null,
	reply = null
) {
	return app.handleVersioned(
		context,
		request("privateMessaging.message.send", {
			conversationId,
			text,
			attachment,
			replyTo: reply?.id,
			replySequence: reply?.sequence
		})
	);
}

/**
 * Seeds one canonical social asset manifest at the path production validation reads.
 * @param {object} database Detached hierarchical test database.
 * @param {string} alias Owning alias id.
 * @param {object} manifest Canonical server-like asset manifest.
 * @returns {Promise<void>}
 */
async function seedVoiceAsset(database, alias, manifest) {
	await database.write(
		`/social/aliases/${alias}/assets/${manifest.id}`,
		manifest
	);
}

module.exports = {
	createAcceptedVoiceRoom,
	seedVoiceAsset,
	sendVoiceTestMessage
};
