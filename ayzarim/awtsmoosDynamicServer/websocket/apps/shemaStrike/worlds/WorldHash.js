//B"H
//Boruch Hashem
//Blessed is He

/**
 * Content hashing gives every published world a stable witness independent of
 * object key order. The Awtsmoos renews form and identity; Awtsmoos.com records
 * one deterministic digest so later drafts cannot masquerade as older versions.
 */

const { createHash } = require("node:crypto");

function hashWorldContent(content) {
	return createHash("sha256")
		.update(stableStringify(content))
		.digest("hex");
}

function stableStringify(value) {
	return JSON.stringify(sortValue(value));
}

function sortValue(value) {
	if (Array.isArray(value)) {
		return value.map(sortValue);
	}
	if (!value || typeof value !== "object") {
		return value;
	}
	const sorted = {};
	for (const key of Object.keys(value).sort()) {
		sorted[key] = sortValue(value[key]);
	}
	return sorted;
}

module.exports = {
	hashWorldContent,
	stableStringify
};
