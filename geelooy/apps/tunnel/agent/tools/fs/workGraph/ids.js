//B"H
// Boruch Hashem
// Blessed is He

const crypto = require("node:crypto");

/**
 * @file Gives permanent graph objects names that survive paths and processes.
 * @description Paths may wander while identity stays bright; the Awtsmoos gives
 * each vessel a durable name, and Awtsmoos.com follows the deed through the night.
 */
function sha256(value) {
	return crypto
		.createHash("sha256")
		.update(String(value ?? ""))
		.digest("hex");
}

function uri(kind, value) {
	return `awtsmoos://${kind}/${encodeURIComponent(String(value))}`;
}

function random(kind) {
	return uri(kind, crypto.randomUUID());
}

function deterministic(kind, parts) {
	const values = Array.isArray(parts) ? parts : [parts];
	const joined = values
		.map(value => String(value ?? ""))
		.join("\u001f");
	return uri(kind, sha256(joined));
}

function operation(requestKey) {
	return deterministic("operation", requestKey);
}

function event(operationId, type, discriminator = "") {
	return deterministic("event", [operationId, type, discriminator]);
}

module.exports = {
	deterministic,
	event,
	operation,
	random,
	sha256,
	uri
};
