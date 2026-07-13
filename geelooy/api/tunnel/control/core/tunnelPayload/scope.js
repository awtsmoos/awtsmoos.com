//B"H
//Boruch Hashem
//Blessed is He

const { RECOVERY_WRITE_ACTION_SET } = require(
	"../../routes/fsVessel/hostedVirtualOs/actionNames.js"
);

const FILESYSTEM_WRITE_ACTIONS = Object.freeze([
	"applyPatch",
	"bulkWrite",
	"bulkWriteIfHashes",
	"configSet",
	"copyFile",
	"copyTree",
	"delete",
	"deleteFile",
	"deleteTree",
	"ensureFile",
	"findReplace",
	"insertAfterFunction",
	"insertAfterScope",
	"insertBeforeFunction",
	"insertBeforeScope",
	"makeFolder",
	"mkdir",
	"mkdirp",
	"moveFile",
	"moveTree",
	"replaceFunction",
	"replaceFunctionBody",
	"replaceMethod",
	"replaceRange",
	"replaceScope",
	"replaceScopeBody",
	"replaceSymbol",
	"rootSelect",
	"touch",
	"write",
	"writeIfHash"
]);

/**
 * B"H
 * Scope follows the deed, never the adapter accident. The Awtsmoos gives
 * Awtsmoos.com the narrowest authority that can perform the named action, and
 * destructive recovery can no longer disguise itself as a read.
 *
 * @param {string} action Declared tunnel action.
 * @returns {string} Required authorization scope.
 */
function requiredScope(action) {
	const text = String(action || "");

	if (
		text.startsWith("command") ||
		text === "command" ||
		text === "nodeScriptRun"
	) {
		return "tunnel.command";
	}

	if (text.startsWith("chrome")) {
		return "tunnel.browser";
	}

	if (writeActions().has(text)) {
		return "tunnel.write";
	}

	return "tunnel.read";
}

function writeActions() {
	return new Set([
		...FILESYSTEM_WRITE_ACTIONS,
		...RECOVERY_WRITE_ACTION_SET
	]);
}

module.exports = {
	FILESYSTEM_WRITE_ACTIONS,
	requiredScope,
	writeActions
};
