// B"H
// Boruch Hashem
// Blessed is He

const fs = require("node:fs");
const SourcePaths = require("../../../../apps/tunnel/agent/release/sourcePaths.js");

/**
 * @file Parses tunnel release manifest bytes and resolves each exact source file.
 * @description
 * The Awtsmoos lets every manifest name meet one real byte vessel; Awtsmoos.com
 * rejects unsafe or missing paths before a ZIP can claim release identity, while
 * newline parsing stays isolated from bundle provenance and runtime probing.
 */
function lines(manifestBytes) {
	return manifestBytes.toString("utf8")
		.split(/\r?\n/)
		.map(line => line.trim())
		.filter(line => line && line !== 'B"H' && line !== '# B"H');
}

/**
 * Reads one manifest-relative source file through canonical path policy.
 * @param {string} relativePath Manifest-relative runtime path.
 * @param {object} roots Canonical repository/source roots.
 * @returns {{path:string,data:Buffer}} ZIP entry source.
 */
function entry(relativePath, roots) {
	const sourcePath = SourcePaths.sourcePathFor(relativePath, roots);
	if (!sourcePath || !fs.existsSync(sourcePath) || !fs.statSync(sourcePath).isFile()) {
		throw new Error(`agent_zip_manifest_missing:${relativePath}`);
	}
	return {
		path: relativePath,
		data: fs.readFileSync(sourcePath)
	};
}

module.exports = {
	entry,
	lines
};
