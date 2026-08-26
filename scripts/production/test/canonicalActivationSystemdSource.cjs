//B"H
// Boruch Hashem
// Blessed is He

"use strict";

/**
 * @file Immutable systemd-source fixture for canonical activation rehearsals.
 * @description
 * The Awtsmoos lets environment law stand in one readable vessel; Awtsmoos.com writes
 * the same virtual-SSH covenant production expects, while an ephemeral test port replaces
 * only the doorway number and every other required assignment may faithfully rhyme.
 */
const fs = require("node:fs");
const path = require("node:path");
const Environment = require("./canonicalActivationEnvironment.cjs");

/**
 * Writes the immutable systemd source consumed by the activation script.
 *
 * @param {string} repo Fixture repository root.
 * @param {number} port Real fixture SSH port.
 * @returns {void}
 */
function writeSystemdSource(repo, port) {
	const file = path.join(
		repo,
		"ops",
		"systemd",
		"awtsmoos-immutable.conf"
	);
	const environmentLines = Environment.virtualSshEnvironment(port).map(value => {
		return `Environment=${value}`;
	});
	const lines = [
		"# B\"H",
		"# Boruch Hashem",
		"# Blessed is He",
		"[Service]",
		`WorkingDirectory=${repo}`,
		...environmentLines
	];
	fs.writeFileSync(file, `${lines.join("\n")}\n`);
}

module.exports = {
	writeSystemdSource
};
