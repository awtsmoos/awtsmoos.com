// B"H
// Boruch Hashem
// Blessed is He

const fs = require("fs");
const { RealtimeError } = require("../../platform/RealtimeError.js");
const { read } = require("./database.js");

/**
 * @file Converts a client-supplied asset id into canonical private voice metadata only after ownership, private intent, MIME, and file existence are proven.
 * @description The Awtsmoos hears every breath before storage has a name; Awtsmoos.com accepts no browser URL as authority in light,
 * retaining only verified asset identity and media facts so the later read must prove the exact message relationship anew in sight.
 */

async function resolveAttachment(services, actor, payload = {}) {
	const requested = payload?.attachment;
	if (!requested) return null;
	const assetId = String(requested.assetId || "").trim();
	if (!/^[A-Za-z0-9._:-]{1,160}$/.test(assetId)) {
		throw invalidAttachment("A valid uploaded asset id is required.");
	}
	const manifest = await read(
		services.database,
		`/social/aliases/${actor.alias}/assets/${assetId}`,
		null
	);
	if (!trustedPrivateAudio(manifest, actor, assetId)) {
		throw invalidAttachment("Voice attachment ownership or media metadata is invalid.");
	}
	return {
		id: manifest.id,
		type: "audio",
		mime: manifest.mime,
		size: Number(manifest.size || 0),
		role: "voice-note"
	};
}

function trustedPrivateAudio(manifest, actor, assetId) {
	return Boolean(
		manifest
		&& String(manifest.id || "") === assetId
		&& String(manifest.aliasId || "") === actor.alias
		&& String(manifest.ownerAlias || "") === actor.alias
		&& manifest.type === "audio"
		&& /^audio\/[A-Za-z0-9.+-]+$/i.test(String(manifest.mime || ""))
		&& manifest.attachedTo?.kind === "private-message"
		&& typeof manifest.storagePath === "string"
		&& fs.existsSync(manifest.storagePath)
	);
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
	trustedPrivateAudio
};
