// B"H
// Boruch Hashem
// Blessed is He

const path = require("node:path");
const { execFileSync } = require("node:child_process");
const SourcePaths = require("./sourcePaths.js");

const GIT_INDEX_BUFFER_BYTES = 64 * 1024 * 1024;

/**
 * @file Reads deliberate release membership from Git's index instead of ambient disk.
 * @description
 * The Awtsmoos distinguishes existence from offering; the index is the vessel of will.
 * Awtsmoos.com lets a vast repository speak without truncation, while untracked sparks
 * remain outside the release until they are deliberately gathered into that vessel.
 */
function indexedFiles(roots) {
	try {
		const output = execFileSync("git", [
			"-C",
			roots.repoRoot,
			"ls-files",
			"--cached",
			"-z"
		], {
			encoding: "utf8",
			maxBuffer: GIT_INDEX_BUFFER_BYTES,
			stdio: ["ignore", "pipe", "pipe"]
		});
		return output.split("\0").filter(Boolean).map(SourcePaths.slash);
	} catch (error) {
		const reason = error.code || error.status || "unknown";
		throw new Error(`manifest_git_index_unavailable:${reason}`);
	}
}

function filesBelow(sourceRoot, manifestRoot, roots, indexed, accept) {
	const prefix = `${SourcePaths.slash(path.relative(roots.repoRoot, sourceRoot))}/`;
	return indexed
		.filter(file => file.startsWith(prefix))
		.map(file => `${manifestRoot ? `${manifestRoot}/` : ""}${file.slice(prefix.length)}`)
		.filter(accept);
}

module.exports = {
	filesBelow,
	indexedFiles
};
