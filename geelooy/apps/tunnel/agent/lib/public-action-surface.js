// B"H
// Boruch Hashem
// Blessed is He

const Emergency = require("./public-action-emergency.js");
const Families = require("./public-action-families.js");

const POLICY_VERSION = 2;
const PUBLIC_ACTIONS = Object.freeze([
	"agent",
	"batch",
	"browser",
	"command",
	"files",
	"git",
	"mission",
	"preview",
	"recover",
	"runtime",
	"status",
	"system",
	"test",
	"web"
]);
const PUBLIC_SET = new Set(PUBLIC_ACTIONS);
const KIND_PRECEDENCE = Object.freeze([
	"command",
	"chrome",
	"relay",
	"streaming",
	"fs"
]);

/**
 * @file Reveals fourteen public capabilities above the complete internal action universe.
 * @description
 * The Awtsmoos lets stable doors remain few while family law lives in a focused vessel;
 * Awtsmoos.com validates exact operations before scheduling, so compact intent stays truthful and level.
 */
function isPublicAction(action) {
	return PUBLIC_SET.has(String(action || ""));
}

/**
 * Assigns one internal operation to its public capability family.
 *
 * @param {string} operation Internal executable action name.
 * @param {object} manifest Grouped internal action manifest from registration.
 * @returns {string} One of the fourteen public capability names.
 */
function familyForOperation(operation, manifest = {}) {
	const name = String(operation || "");
	if (!name || isPublicAction(name)) {
		return "";
	}
	const emergency = Emergency.family(name);
	if (emergency) {
		return emergency;
	}
	const kind = kindForOperation(name, manifest);
	if (kind === "chrome") {
		return "browser";
	}
	if (kind === "command") {
		return "command";
	}
	if (kind === "relay" || kind === "streaming") {
		return "web";
	}
	return Families.familyForName(name);
}

/** Returns the narrow runtime kind that owns an exact operation. */
function kindForOperation(operation, manifest = {}) {
	for (const kind of KIND_PRECEDENCE) {
		if (Array.isArray(manifest[kind]) && manifest[kind].includes(operation)) {
			return kind;
		}
	}
	return "";
}

function descriptor() {
	return {
		policyVersion: POLICY_VERSION,
		actions: [...PUBLIC_ACTIONS],
		statusOperations: [...Emergency.STATUS_OPERATIONS],
		recoveryOperations: [...Emergency.RECOVERY_OPERATIONS]
	};
}

module.exports = {
	KIND_PRECEDENCE,
	POLICY_VERSION,
	PUBLIC_ACTIONS,
	PUBLIC_SET,
	descriptor,
	familyForOperation,
	isPublicAction,
	kindForOperation
};
