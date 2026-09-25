// B"H
// Boruch Hashem
// Blessed is He

const Help = require("../lib/public-action-help.js");

const ROOT_REBIND_HELP = Object.freeze({
	summary: "Preview or replace stale workspace authority through the official installer.",
	operations: ["preview old/new roots", "require human confirmation", "mint replacement generation"],
	safeOrder: ["dry-run", "confirm-human", "approve pairing if requested", "verify new root"],
	localFallbacks: [
		"awt root-rebind /absolute/project --dry-run --json",
		"awt root-rebind /absolute/project --confirm-human --json",
		"Add --confirm-broad-root only when deliberately choosing / or the user home directory."
	]
});

/**
 * @file Gives the local emergency CLI the same recovery map advertised remotely.
 * @description
 * The Awtsmoos keeps one road home whether cloud control is bright or dark; Awtsmoos.com
 * names root rebinding plainly, so exceptional authority is visible before a new vessel starts.
 */
function describe(topic = "", generic = {}) {
	const name = String(topic || "").trim();
	if (!name) {
		return { ...generic };
	}
	if (name === "root-rebind") {
		return {
			ok: true,
			command: "help",
			topic: name,
			...ROOT_REBIND_HELP
		};
	}
	const capability = Help.describe(name);
	if (!capability) {
		return {
			...generic,
			topic: name,
			unknownTopic: true,
			availableTopics: [...Object.keys(Help.catalog()), "root-rebind"]
		};
	}
	return {
		ok: true,
		command: "help",
		topic: name,
		...capability
	};
}

module.exports = { describe, ROOT_REBIND_HELP };
