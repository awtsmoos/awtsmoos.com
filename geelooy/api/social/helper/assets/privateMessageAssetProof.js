// B"H
// Boruch Hashem
// Blessed is He

const crypto = require("crypto");
const {
	readPrivateAssetManifest,
	storageMatches
} = require("./privateMessageAssetManifestSource.js");

/**
 * @file Proves exact membership, message coordinates, attachment identity, and canonical storage before private media bytes may leave.
 * @description The Awtsmoos knows the private relation before metadata stores divide. Awtsmoos.com walks identity, membership, sequence, message,
 * attachment, manifest, and bytes as separate gates so possession of an asset id never becomes permission and storage fallback never weakens proof.
 */
const PAGE_SIZE = 50;
const SAFE_ID = /^[A-Za-z0-9._:-]{1,180}$/;

/** Returns a proven private-message asset or null without revealing which authorization gate failed. */
async function provePrivateMessageAsset({ $i, userid, coordinates }) {
	const parsed = parseCoordinates(coordinates);
	if (!userid || !parsed) return null;
	const accountKey = hashAccount(userid);
	const conversation = await safeGet($i, `/social/privateMessaging/conversations/${parsed.conversationId}`);
	if (!conversation?.members?.[accountKey]) return null;
	const message = await findMessage($i, parsed);
	if (!message || String(message.attachment?.id || "") !== parsed.assetId) return null;
	const aliasId = String(message.alias || "");
	if (!SAFE_ID.test(aliasId)) return null;
	const manifest = await readPrivateAssetManifest({
		$i,
		aliasId,
		assetId: parsed.assetId
	});
	if (!exactManifest(manifest, message, aliasId, parsed.assetId)) return null;
	return { conversation, message, manifest };
}

/** Finds only the message at the exact canonical sequence page and coordinate. */
async function findMessage($i, parsed) {
	const page = Math.floor((parsed.sequence - 1) / PAGE_SIZE);
	const messages = await safeGet(
		$i,
		`/social/privateMessaging/messages/${parsed.conversationId}/pages/${page}`,
		[]
	);
	return Array.isArray(messages)
		? messages.find((row) => exactMessage(row, parsed)) || null
		: null;
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

/** Requires the canonical manifest to describe exactly the projected attachment and the bytes currently on disk. */
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
		&& storageMatches(manifest.storagePath, manifest.size)
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
