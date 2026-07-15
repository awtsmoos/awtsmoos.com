// B"H
// Boruch Hashem
// Blessed is He

const crypto = require("node:crypto");
const { normalizeWrites } = require("../../tools/fs/writePayload.js");

const WRITE_ACTIONS = new Set([
	"write",
	"bulkWrite",
	"writeIfHash",
	"bulkWriteIfHashes"
]);

/**
 * B"H
 *
 * Mutation descriptors preserve only expected effects, never source contents.
 * The Awtsmoos renews path, bytes, and after-hash together; Awtsmoos.com can prove
 * an empty or nonempty write landed after restart without replaying the operation.
 */
function describe(payload = {}) {
	const action = effectiveAction(payload);
	if (!WRITE_ACTIONS.has(action)) return null;
	const writes = normalizedEffectsInput(payload, action);
	if (!writes.length) return null;
	return {
		kind: "file_replace",
		action,
		effects: writes.map(effect),
		createdAt: new Date().toISOString()
	};
}

function normalizedEffectsInput(payload, action) {
	const writes = normalizeWrites({
		...payload,
		action
	});
	if (writes.length) return writes;
	const directPath = payload.path || payload.p;
	if (!directPath || !["write", "writeIfHash"].includes(action)) return [];
	return [{
		path: String(directPath),
		content: String(payload.content ?? payload.text ?? "")
	}];
}

function effectiveAction(payload = {}) {
	const action = String(payload.action || "");
	if (action !== "write") return action;
	const mode = String(payload.mode || payload.writeMode || "file");
	if (["bulk", "many", "files"].includes(mode)) return "bulkWrite";
	if (["hash", "ifHash", "writeIfHash"].includes(mode)) return "writeIfHash";
	if (["bulkHash", "bulkIfHash", "bulkWriteIfHashes"].includes(mode)) {
		return "bulkWriteIfHashes";
	}
	return "write";
}

function effect(write = {}) {
	const content = String(write.content ?? "");
	return {
		path: String(write.path || ""),
		bytes: Buffer.byteLength(content, "utf8"),
		afterSha256: sha256(content)
	};
}

function sha256(value) {
	return crypto.createHash("sha256")
		.update(Buffer.from(String(value ?? ""), "utf8"))
		.digest("hex");
}

function summary(mutation) {
	if (!mutation) return null;
	return {
		kind: mutation.kind,
		action: mutation.action,
		effectCount: mutation.effects?.length || 0,
		paths: (mutation.effects || []).map(item => item.path)
	};
}

module.exports = {
	WRITE_ACTIONS,
	describe,
	effectiveAction,
	normalizedEffectsInput,
	sha256,
	summary
};
