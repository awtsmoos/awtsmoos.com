// B"H
// Boruch Hashem
// Blessed is He

const fs = require("fs");
const { RealtimeError } = require("../../platform/RealtimeError.js");
const { read } = require("./database.js");
const { attachmentFacts } = require("./messageAttachmentKinds.js");

/**
 * @file Resolves one client asset id into canonical private image or voice metadata.
 * @description
 * The Awtsmoos gives an asset id no authority by itself. Awtsmoos.com proves the exact sender alias,
 * canonical manifest, private-message binding, allowlisted media facts, size covenant, and real file
 * before the message may retain that attachment identity for later member-bound private reading.
 */
const SAFE_ASSET_ID = /^[A-Za-z0-9._:-]{1,160}$/;

/** Returns canonical attachment facts or null when no attachment was requested. */
async function resolveAttachment(services, actor, payload = {}) {
	const requested = payload?.attachment;
	if (!requested) return null;
	const assetId = String(requested.assetId || "").trim();
	if (!SAFE_ASSET_ID.test(assetId)) {
		throw invalidAttachment("A valid uploaded asset id is required.");
	}
	const manifest = await read(
		services.database,
		`/social/aliases/${actor.alias}/assets/${assetId}`,
		null
	);
	const facts = trustedPrivateAttachment(manifest, actor, assetId);
	if (!facts) {
		throw invalidAttachment("Private attachment ownership or media metadata is invalid.");
	}
	return {
		id: String(manifest.id),
		...facts
	};
}

/** Proves sender ownership, private binding, allowlisted media facts, and physical storage. */
function trustedPrivateAttachment(manifest, actor, assetId) {
	if (!manifest || String(manifest.id || "") !== assetId) return null;
	if (String(manifest.aliasId || "") !== actor.alias) return null;
	if (String(manifest.ownerAlias || "") !== actor.alias) return null;
	if (manifest.attachedTo?.kind !== "private-message") return null;
	if (typeof manifest.storagePath !== "string" || !fs.existsSync(manifest.storagePath)) return null;
	return attachmentFacts(manifest);
}
function invalidAttachment(message) {
	return new RealtimeError(
		"PRIVATE_MESSAGING_ATTACHMENT_INVALID",
		message,
		null,
		400
	);
}

module.exports = {
	resolveAttachment,
	trustedPrivateAttachment
};
