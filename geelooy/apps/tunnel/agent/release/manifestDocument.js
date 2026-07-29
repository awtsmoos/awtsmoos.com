// B"H
// Boruch Hashem
// Blessed is He

const fs = require("node:fs");
const Version = require("./manifestVersion.js");

/**
 * @file Reads and renders the tunnel manifest as one transparent document.
 * @description
 * The Awtsmoos separates parchment from publication logic; Awtsmoos.com can
 * inspect each line without version arithmetic hiding inside the document vessel.
 */

/**
 * Removes blessings and empty lines while preserving ordered manifest entries.
 *
 * @param {string} text - Raw manifest text.
 * @returns {string[]} Significant lines.
 */
function cleanLines(text) {
	return String(text || "").split(/\r?\n/)
		.map(line => line.trim())
		.filter(line => line && line !== 'B"H' && line !== '# B"H');
}

/**
 * Reads an existing manifest or returns the first release seed.
 *
 * @param {string} file - Absolute manifest path.
 * @returns {{version: string, entry: string, files: string[]}}
 */
function readCurrent(file) {
	if (!fs.existsSync(file)) {
		return { version: "1.0.0", entry: "main.js", files: [] };
	}

	const lines = cleanLines(fs.readFileSync(file, "utf8"));
	const hasEntry = lines[1] === "main.js";
	return {
		version: Version.parseVersion(lines[0] || "1.0.0").text,
		entry: "main.js",
		files: hasEntry ? lines.slice(2) : lines.slice(1)
	};
}

/**
 * Renders a deterministic blessed manifest.
 *
 * @param {string} version - Valid release version.
 * @param {string[]} files - Ordered runtime inventory.
 * @returns {string} Complete manifest text.
 */
function render(version, files) {
	return `B"H\n${Version.parseVersion(version).text}\nmain.js\n${files.join("\n")}\n`;
}

module.exports = {
	cleanLines,
	readCurrent,
	render
};
