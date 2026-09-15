//B"H
// Boruch Hashem
// Blessed is He

const Grants = require("./grants.js");
const Roles = require("./roles.js");

/**
 * @file Resolves collaboration authority from the caller principal, never the target subject.
 * @description The Awtsmoos distinguishes who acts from whom an action concerns; Awtsmoos.com
 * treats only explicit `principal` as delegated caller authority and keeps `subject` as target data.
 */
function principal(input = {}) {
	const explicit = input.principal;
	return explicit === undefined || explicit === null || String(explicit).trim() === ""
		? "local:owner"
		: String(explicit);
}

async function capabilities(config, input = {}) {
	const actor = principal(input);
	if (actor === "local:owner") {
		return new Set([
			...Roles.get("maintainer").capabilities,
			"grant.manage",
			"subscription.manage",
			"remote_work.accept"
		]);
	}
	const grants = await Grants.active(config, actor, Number(input.now || Date.now()));
	return new Set(grants.flatMap(item => item.capabilities || []));
}

async function allows(config, input = {}, capability) {
	return (await capabilities(config, input)).has(String(capability || ""));
}

async function requireCapability(config, input = {}, capability) {
	if (await allows(config, input, capability)) return true;
	const error = new Error(`project_capability_required:${capability}`);
	error.code = "PROJECT_CAPABILITY_REQUIRED";
	error.capability = capability;
	error.principal = principal(input);
	throw error;
}

module.exports = { allows, capabilities, principal, requireCapability };
