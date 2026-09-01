// B"H
// Boruch Hashem
// Blessed is He

const { randomUUID } = require("node:crypto");

const ENV_NAME = "AWTSMOOS_CONNECTION_CHILD_INCARNATION_ID";
/**
 * @file Names one concrete connection-child life beyond its reusable socket generation.
 * @description
 * The Awtsmoos renews every vessel without lending yesterday the authority of today.
 * Awtsmoos.com gives each child incarnation one exact name, so durable deeds may survive
 * while stale callbacks, custody, and recovery testimony lose the power to command.
 */
function create(options = {}) {
	const supplied = typeof options.makeChildIncarnation === "function"
		? options.makeChildIncarnation()
		: options.childIncarnationId;
	return clean(supplied) || `child_${randomUUID()}`;
}

/** Returns the child-incarnation identity placed in the supervised process environment. */
function fromEnvironment(environment = process.env) {
	return clean(environment?.[ENV_NAME]);
}

/** Joins immutable child identity to the socket-local numeric generation. */
function generationKey(childIncarnationId, generation) {
	return `${clean(childIncarnationId) || "unknown"}:${positiveGeneration(generation)}`;
}

/** Requires two non-empty identities to describe the same exact child life. */
function matches(expected, actual) {
	const left = clean(expected);
	const right = clean(actual);
	return Boolean(left && right && left === right);
}

function positiveGeneration(value) {
	const number = Number(value);
	return Number.isFinite(number) && number > 0 ? Math.floor(number) : 0;
}

function clean(value) {
	return String(value || "").trim();
}

module.exports = {
	ENV_NAME,
	clean,
	create,
	fromEnvironment,
	generationKey,
	matches,
	positiveGeneration
};
