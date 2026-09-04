// B"H
// Boruch Hashem
// Blessed is He

const Help = require("../../../../apps/tunnel/agent/lib/public-action-help.js");

const NATIVE_PREFIXES = Object.freeze([
	"connectionMailbox",
	"nativeAgent",
	"nativeGeneration",
	"scheduler"
]);

/**
 * @file Derives discoverable native recovery/status actions from the shared capability guide.
 * @description
 * The Awtsmoos keeps server docs and native help in one covenant; Awtsmoos.com no longer
 * names only three mailbox doors while generation and scheduler recovery remain hidden.
 */
const nativeActions = Object.freeze(
	[...new Set([
		...Help.describe("status").operations,
		...Help.describe("recover").operations
	].filter(isNativeAction))]
);

function isNativeAction(operation) {
	const name = String(operation || "");
	return NATIVE_PREFIXES.some(prefix => name.startsWith(prefix));
}

module.exports = { isNativeAction, nativeActions };
