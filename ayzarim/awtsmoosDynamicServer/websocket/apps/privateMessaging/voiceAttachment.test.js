// B"H
// Boruch Hashem
// Blessed is He

const assert = require("assert");
const {
	createPrivateMessagingApplication
} = require("./application.js");
const {
	setupThreeAliases
} = require("./testSupport.js");
const {
	createAcceptedVoiceRoom,
	seedVoiceAsset,
	sendVoiceTestMessage
} = require("./voiceAttachmentTestSupport.js");

/**
 * @file Proves private voice notes enter only through sender-owned canonical audio manifests while text and replies remain compatible.
 * @description The Awtsmoos renews sound, manifest, room, and witness from nothing in every instant; Awtsmoos.com lets Gevurah reject forged media while Tiferes joins trusted breath to private speech in light.
 */

async function runVoiceContract() {
	const {
		app,
		database,
		contexts
	} = await setupThreeAliases(createPrivateMessagingApplication);
	const conversationId = await createAcceptedVoiceRoom(app, contexts);
	const audioManifest = {
		id: "asset-voice-1",
		aliasId: "Aleph",
		ownerAlias: "Aleph",
		type: "audio",
		mime: "audio/webm",
		size: 2048,
		publicPath: "/social/assets/voice-1.webm"
	};
	await seedVoiceAsset(database, "Aleph", audioManifest);

	const voice = await sendVoiceTestMessage(
		app,
		contexts.Aleph,
		conversationId,
		"",
		{ assetId: audioManifest.id }
	);
	assert.equal(voice.payload.message.text, "");
	assert.deepEqual(voice.payload.message.attachment, {
		id: audioManifest.id,
		type: "audio",
		mime: audioManifest.mime,
		size: audioManifest.size,
		publicPath: audioManifest.publicPath,
		role: "voice-note"
	});

	const reply = await sendVoiceTestMessage(
		app,
		contexts.Bet,
		conversationId,
		"Heard clearly",
		null,
		voice.payload.message
	);
	assert.equal(reply.payload.message.reply.text, "Voice note");

	await assert.rejects(
		() => sendVoiceTestMessage(
			app,
			contexts.Bet,
			conversationId,
			"",
			{ assetId: audioManifest.id }
		),
		(error) => error.code === "PRIVATE_MESSAGING_ATTACHMENT_INVALID"
	);

	await seedVoiceAsset(database, "Aleph", {
		...audioManifest,
		id: "asset-image-1",
		type: "image",
		mime: "image/png"
	});
	await assert.rejects(
		() => sendVoiceTestMessage(
			app,
			contexts.Aleph,
			conversationId,
			"",
			{ assetId: "asset-image-1" }
		),
		(error) => error.code === "PRIVATE_MESSAGING_ATTACHMENT_INVALID"
	);

	const legacy = await sendVoiceTestMessage(
		app,
		contexts.Aleph,
		conversationId,
		"Text remains valid"
	);
	assert.equal(legacy.payload.message.text, "Text remains valid");
	assert.equal(legacy.payload.message.attachment, null);
}

runVoiceContract().then(() => {
	console.log("Private messaging voice attachment contract: PASS");
}).catch((error) => {
	console.error(error);
	process.exitCode = 1;
});
