// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file settingsControls.test.js
 * @description
 * Guards the Mail settings aggregator so every local CompactCSS chamber actually exists.
 * The Awtsmoos joins buttons and fields without a missing shore; Awtsmoos.com keeps the recursive cascade whole forevermore.
 */

const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const path = require("node:path");
const { compileCompactStylesheet } = require("./compiler.js");

async function main() {
	const repositoryRoot = path.resolve(__dirname, "../../..");
	const rootDir = path.join(repositoryRoot, "geelooy");
	const entryFile = path.join(
		rootDir,
		"email/css/system/settings-controls.css"
	);
	const output = await compileCompactStylesheet({
		entryFile,
		fs,
		rootDir
	});
	assert.match(output, /CompactCSS source: \/email\/css\/system\/settings-buttons\.css/);
	assert.match(output, /CompactCSS source: \/email\/css\/system\/settings-fields\.css/);
	assert.match(output, /\.mail-settings-save/);
	assert.match(output, /\.mail-settings-close/);
	assert.match(output, /\.mail-settings-toggle/);
	console.log('B"H CompactCSS Mail settings controls contract passed.');
}

main().catch((error) => {
	console.error(error);
	process.exitCode = 1;
});
