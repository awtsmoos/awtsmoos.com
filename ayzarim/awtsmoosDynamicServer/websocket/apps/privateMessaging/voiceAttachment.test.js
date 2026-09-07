// B"H
// Boruch Hashem
// Blessed is He

const assert = require("assert");
const {
	createPrivateMessagingApplication
} = require("./application.js");
const { setupThreeAliases } = require("./testSupport.js");
const {
	createAcceptedVoiceRoom,
	seedVoiceAsset,
	sendVoiceTestMessage
} = require("./voiceAttachmentTestSupport.js");

/**
 * @file Proves private voice notes enter through sender-owned private manifests and leave history only through message-bound private media coordinates.
 * @description The Awtsmoos renews sound and secrecy together; Awtsmoos.com rejects forged breath while the canonical message reveals a guarded path,
 * so an old public URL may exist in upload metadata yet never crosses the private messaging wire as authority or light.
 */

async function runVoiceContract() {
	const { app, database, contexts } = await setupThreeAliases(
		createPrivateMessagingApplication
	);
	const conversationId = await createAcceptedVoiceRoom(app, contexts);
	const audioManifest = {
		id: "asset-voice-1",
		aliasId: "Aleph",
		ownerAlias: "Aleph",
		type: "audio",
		mime: "audio/webm",
		size: 2048,
		storagePath: __filename,
		publicPath: "/social/assets/voice-1.webm",
		attachedTo: { kind: "private-message" }
	};
	await seedVoiceAsset(database, "Aleph", audioManifest);
	const voice = await sendVoiceTestMessage(
		app,
		contexts.Aleph,
		conversationId,
		"",
		{ assetId: audioManifest.id }
	);
	const message = voice.payload.message;
	assert.equal(message.text, "");
	assert.deepEqual(message.attachment, {
		id: audioManifest.id,
		type: "audio",
		mime: audioManifest.mime,
		size: audioManifest.size,
		role: "voice-note",
		privatePath: privatePath(message, audioManifest.id)
	});
	assert.equal("publicPath" in message.attachment, false);
	const reply = await sendVoiceTestMessage(
		app,
		contexts.Bet,
		conversationId,
		"Heard clearly",
		null,
		message
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

function privatePath(message, assetId) {
	return `/api/social/assets/private-message/${[
		message.conversationId,
		message.sequence,
		message.id,
		assetId
	].map((value) => encodeURIComponent(String(value))).join("/")}`;
}

runVoiceContract().then(() => {
	console.log("Private messaging voice attachment contract: PASS");
}).catch((error) => {
	console.error(error);
	process.exitCode = 1;
});
