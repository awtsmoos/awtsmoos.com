// B"H
// Boruch Hashem
// Blessed is He

const crypto = require("crypto");
const fs = require("fs");
const { readAssetManifest } = require("./assetManifest.js");

/**
 * @file Proves that authenticated private-message media belongs to the exact canonical message requested by a current conversation member.
 * @description The Awtsmoos knows every vessel without guessing its road; Awtsmoos.com therefore walks identity, membership, sequence, message, attachment,
 * and canonical manifest one gate at a time, so possession of an asset id never becomes permission and private light remains bound to its true relation.
 */

const PAGE_SIZE = 50;
const SAFE_ID = /^[A-Za-z0-9._:-]{1,180}$/;

/** Returns a fully proven private-message asset record or null without revealing which gate failed. */
async function provePrivateMessageAsset({ $i, userid, coordinates }) {
	const parsed = parseCoordinates(coordinates);
	if (!userid || !parsed) return null;
	const accountKey = hashAccount(userid);
	const conversation = await safeGet($i, `/social/privateMessaging/conversations/${parsed.conversationId}`);
	if (!conversation?.members?.[accountKey]) return null;
	const page = Math.floor((parsed.sequence - 1) / PAGE_SIZE);
	const messages = await safeGet(
		$i,
		`/social/privateMessaging/messages/${parsed.conversationId}/pages/${page}`,
		[]
	);
	const message = Array.isArray(messages)
		? messages.find((row) => exactMessage(row, parsed))
		: null;
	if (!message || String(message.attachment?.id || "") !== parsed.assetId) return null;
	const aliasId = String(message.alias || "");
	if (!SAFE_ID.test(aliasId)) return null;
	const manifest = readAssetManifest({ aliasId, assetId: parsed.assetId })
		|| await safeGet($i, `/social/aliases/${aliasId}/assets/${parsed.assetId}`);
	if (!exactManifest(manifest, message, aliasId, parsed.assetId)) return null;
	return { conversation, message, manifest };
}

function parseCoordinates(value = {}) {
	const conversationId = String(value.conversationId || "").trim();
	const messageId = String(value.messageId || "").trim();
	const assetId = String(value.assetId || "").trim();
	const sequence = Number(value.sequence);
	if (!SAFE_ID.test(conversationId) || !SAFE_ID.test(messageId) || !SAFE_ID.test(assetId)) return null;
	if (!Number.isSafeInteger(sequence) || sequence < 1) return null;
	return { conversationId, messageId, assetId, sequence };
}

function exactMessage(message, parsed) {
	return String(message?.id || "") === parsed.messageId
		&& String(message?.conversationId || "") === parsed.conversationId
		&& Number(message?.sequence) === parsed.sequence;
}

function exactManifest(manifest, message, aliasId, assetId) {
	const attachment = message?.attachment;
	return Boolean(
		manifest
		&& attachment
		&& String(manifest.id || "") === assetId
		&& String(manifest.aliasId || "") === aliasId
		&& String(manifest.ownerAlias || "") === aliasId
		&& manifest.attachedTo?.kind === "private-message"
		&& String(manifest.type || "") === String(attachment.type || "")
		&& String(manifest.mime || "") === String(attachment.mime || "")
		&& Number(manifest.size || 0) === Number(attachment.size || 0)
		&& typeof manifest.storagePath === "string"
		&& fs.existsSync(manifest.storagePath)
	);
}

function hashAccount(userid) {
	return crypto.createHash("sha256").update(String(userid)).digest("hex");
}

async function safeGet($i, path, fallback = null) {
	try {
		const value = await $i.db.get(path);
		return value === undefined || value === null ? fallback : value;
	} catch {
		return fallback;
	}
}

module.exports = {
	PAGE_SIZE,
	exactManifest,
	hashAccount,
	parseCoordinates,
	provePrivateMessageAsset
};
