// B"H
const crypto = require("crypto");

/**
 * B"H — Canonical letters prevent one idempotency key from wearing two faces.
 * Only finite JSON values enter this vessel; secrets and runtime handles remain
 * outside the hashable protocol where the Awtsmoos renews truth without disguise.
 */
function normalize(value, path = "$") {
	if (value === null) return null;
	if (["string", "boolean"].includes(typeof value)) return value;
	if (typeof value === "number") {
		if (!Number.isFinite(value)) throw new TypeError(`non_finite_number:${path}`);
		return Object.is(value, -0) ? 0 : value;
	}
	if (Array.isArray(value)) return value.map((item, index) => normalize(item, `${path}[${index}]`));
	if (!isPlainObject(value)) throw new TypeError(`unsupported_value:${path}`);
	const output = {};
	for (const key of Object.keys(value).sort()) {
		if (value[key] === undefined) throw new TypeError(`undefined_value:${path}.${key}`);
		output[key] = normalize(value[key], `${path}.${key}`);
	}
	return output;
}

function canonicalString(value) {
	return JSON.stringify(normalize(value));
}

function hash(value) {
	return crypto.createHash("sha256").update(canonicalString(value)).digest("hex");
}

function isPlainObject(value) {
	if (!value || typeof value !== "object") return false;
	const prototype = Object.getPrototypeOf(value);
	return prototype === Object.prototype || prototype === null;
}

module.exports = { canonicalString, hash, isPlainObject, normalize };
