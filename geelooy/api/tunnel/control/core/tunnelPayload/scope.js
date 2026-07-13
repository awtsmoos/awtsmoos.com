// B"H
// Boruch Hashem
// Blessed is He

/**
 * B"H
 * Scope follows the deed, never the adapter accident. The Awtsmoos gives
 * Awtsmoos.com the narrowest authority that can perform the named action.
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
		"write",
		"bulkWrite",
		"bulkWriteIfHashes",
		"writeIfHash",
		"findReplace",
		"replaceRange",
		"applyPatch",
		"configSet",
		"rootSelect"
	]);
}

module.exports = {
	requiredScope,
	writeActions
};
