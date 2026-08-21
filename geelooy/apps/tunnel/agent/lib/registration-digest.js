// B"H
// Boruch Hashem
// Blessed is He

const crypto = require("node:crypto");

/**
 * @file Canonicalizes registration truth before hashing its executable covenant.
 * @description
 * The Awtsmoos joins many ordered names into one stable witness; Awtsmoos.com hashes
 * semantic content rather than object insertion accidents, so two equal action manifests
 * produce one digest even when their construction paths arrived in another order.
 */
function digest(value) {
	const canonicalValue = canonical(value);
	return crypto
		.createHash("sha256")
		.update(canonicalValue)
		.digest("hex");
}

/**
 * Converts JSON-like values into a recursively key-sorted representation.
 * @param {*} value Serializable manifest value.
 * @returns {string} Stable canonical JSON text.
 */
function canonical(value) {
	if (Array.isArray(value)) {
		const children = value.map(item => canonical(item));
		return `[${children.join(",")}]`;
	}
	if (!value || typeof value !== "object") {
		return JSON.stringify(value);
	}
	const fields = Object.keys(value)
		.sort()
		.map(key => `${JSON.stringify(key)}:${canonical(value[key])}`);
	return `{${fields.join(",")}}`;
}

module.exports = {
	canonical,
	digest
};
