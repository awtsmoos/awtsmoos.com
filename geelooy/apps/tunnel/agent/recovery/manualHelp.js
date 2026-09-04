// B"H
// Boruch Hashem
// Blessed is He

const Help = require("../lib/public-action-help.js");

/**
 * @file Gives the local emergency CLI the same recovery map advertised remotely.
 * @description
 * The Awtsmoos keeps one road home whether cloud control is bright or dark; Awtsmoos.com
 * lets `awt help recover` name safe inspection, bounded repair, service repair, and reinstall.
 */
function describe(topic = "", generic = {}) {
	const name = String(topic || "").trim();
	if (!name) return { ...generic };
	const capability = Help.describe(name);
	if (!capability) {
		return {
			...generic,
			topic: name,
			unknownTopic: true,
			availableTopics: Object.keys(Help.catalog())
		};
	}
	return {
		ok: true,
		command: "help",
		topic: name,
		...capability
	};
}

module.exports = { describe };
