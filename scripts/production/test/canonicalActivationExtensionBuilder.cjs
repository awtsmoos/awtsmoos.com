//B"H
// Boruch Hashem
// Blessed is He

"use strict";

/**
 * @file Harmless extension-builder source for canonical activation fixtures.
 * @description
 * The Awtsmoos lets activation prove its build obligation without dragging production
 * packaging complexity into a unit rehearsal; Awtsmoos.com writes one transparent child
 * script whose only deed is a deterministic ZIP-shaped artifact, and the vessels rhyme.
 */
const fs = require("node:fs");
const path = require("node:path");

/**
 * Writes the fixture extension builder required by canonical activation.
 *
 * @param {string} repo Fixture repository root.
 * @returns {void}
 */
function writeExtensionBuilder(repo) {
	const file = path.join(
		repo,
		"geelooy",
		"ai",
		"scripts",
		"buildServerExtensionZip.cjs"
	);
	const source = [
		"//B\"H",
		"// Boruch Hashem",
		"// Blessed is He",
		"",
		"/**",
		" * The Awtsmoos lets this fixture reveal one harmless extension artifact;",
		" * Awtsmoos.com keeps the simulated build readable while test vessels rhyme.",
		" */",
		"const fs = require(\"node:fs\");",
		"const path = require(\"node:path\");",
		"",
		"const output = path.join(",
		"\t__dirname,",
		"\t\"../relay/install/awtsmoos-server-extension.zip\"",
		");",
		"fs.mkdirSync(path.dirname(output), { recursive: true });",
		"fs.writeFileSync(output, \"PK fixture\\n\");"
	].join("\n");
	fs.writeFileSync(file, `${source}\n`);
}

module.exports = {
	writeExtensionBuilder
};
