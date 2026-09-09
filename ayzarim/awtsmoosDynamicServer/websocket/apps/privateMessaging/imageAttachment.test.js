// B"H
// Boruch Hashem
// Blessed is He

const assert = require("assert");
const { createPrivateMessagingApplication } = require("./application.js");
const { setupThreeAliases } = require("./testSupport.js");
const {
	createAcceptedVoiceRoom,
	seedVoiceAsset,
	sendVoiceTestMessage
} = require("./voiceAttachmentTestSupport.js");

/**
 * @file Proves allowlisted private images share voice's exact sender-ownership and guarded-read covenant.
 * @description
 * The Awtsmoos contains image and caption before transport divides them. Awtsmoos.com accepts only
 * sender-owned PNG/JPEG/WebP/GIF manifests within the Social limit and projects no public asset URL.
 */
async function runImageContract() {
	const { app, database, contexts } = await setupThreeAliases(createPrivateMessagingApplication);
	const conversationId = await createAcceptedVoiceRoom(app, contexts);
	const manifest = imageManifest("asset-image-1");
	await seedVoiceAsset(database, "Aleph", manifest);
	const sent = await sendVoiceTestMessage(
		app,
		contexts.Aleph,
		conversationId,
		"Mountain sunrise",
		{ assetId: manifest.id }
	);
	const message = sent.payload.message;
	assert.deepEqual(message.attachment, {
		id: manifest.id,
		type: "image",
		mime: manifest.mime,
		size: manifest.size,
		role: "image",
		privatePath: privatePath(message, manifest.id)
	});
	assert.equal("publicPath" in message.attachment, false);
	const reply = await sendVoiceTestMessage(
		app,
		contexts.Bet,
		conversationId,
		"Beautiful",
		null,
		message
	);
	assert.equal(reply.payload.message.reply.text, "Mountain sunrise");
	const bare = await sendVoiceTestMessage(
		app,
		contexts.Aleph,
		conversationId,
		"",
		{ assetId: manifest.id }
	);
	const bareReply = await sendVoiceTestMessage(
		app,
		contexts.Bet,
		conversationId,
		"Seen",
		null,
		bare.payload.message
	);
	assert.equal(bareReply.payload.message.reply.text, "Photo");
	for (const [id, patch] of [
		["asset-svg", { mime: "image/svg+xml" }],
		["asset-large", { size: 8 * 1024 * 1024 + 1 }]
	]) {
		await seedVoiceAsset(database, "Aleph", { ...manifest, id, ...patch });
		await assert.rejects(
			() => sendVoiceTestMessage(
				app,
				contexts.Aleph,
				conversationId,
				"",
				{ assetId: id }
			),
			(error) => error.code === "PRIVATE_MESSAGING_ATTACHMENT_INVALID"
		);
	}
}

function imageManifest(id) {
	return {
		id,
		aliasId: "Aleph",
		ownerAlias: "Aleph",
		type: "image",
		mime: "image/png",
		size: 4096,
		storagePath: __filename,
		publicPath: `/social/assets/${id}.png`,
		attachedTo: { kind: "private-message" }
	};
}
function privatePath(message, assetId) {
	return `/api/social/assets/private-message/${[
		message.conversationId,
		message.sequence,
		message.id,
		assetId
	].map((value) => encodeURIComponent(String(value))).join("/")}`;
}

runImageContract().then(() => {
	console.log("Private messaging image attachment contract: PASS");
}).catch((error) => {
	console.error(error);
	process.exitCode = 1;
});
