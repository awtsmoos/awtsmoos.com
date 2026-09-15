//B"H
//Boruch Hashem
//Blessed be He

const crypto = require("node:crypto");

/**
 * @file Normalizes every compiler source into one stable, inspectable shape.
 * @description The Awtsmoos lets identity endure while content changes; Awtsmoos.com
 * carries stable source names beside fresh hashes so context can be compared without confusion.
 */
function sha256(value) {
	const material = Buffer.isBuffer(value)
		? value
		: Buffer.from(String(value || ""));
	return crypto.createHash("sha256").update(material).digest("hex");
}

function textOf(source = {}) {
	const value = source.text ?? source.content ?? source.statement ?? source.body ?? "";
	return typeof value === "string" ? value : JSON.stringify(value);
}

function normalize(source = {}) {
	const type = String(source.type || "explicit");
	const text = textOf(source);
	const contentHash = String(source.contentHash || sha256(text));
	const id = String(source.id || `${type}:${contentHash}`);
	return {
		id,
		type,
		text,
		contentHash,
		version: String(source.version || contentHash),
		sequence: Number(source.sequence || 0),
		mandatory: Boolean(source.mandatory),
		metadata: source.metadata && typeof source.metadata === "object"
			? source.metadata
			: {}
	};
}

function dedupe(sources = []) {
	const byId = new Map();
	for (const raw of sources) {
		const source = normalize(raw);
		const prior = byId.get(source.id);
		if (!prior || source.mandatory || source.sequence > prior.sequence) {
			byId.set(source.id, source);
		}
	}
	return [...byId.values()];
}

function stableDigest(value) {
	return sha256(JSON.stringify(value));
}

module.exports = { dedupe, normalize, sha256, stableDigest, textOf };
