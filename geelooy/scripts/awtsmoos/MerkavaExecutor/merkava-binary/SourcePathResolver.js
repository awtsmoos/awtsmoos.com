//B"H
//Boruch Hashem
//Blessed be He

const { resolveSpecifier } = require("./MerkavaVmFileExecutor.js");

/**
 * Resolves one project-relative source path without filesystem or package help.
 * @param {string} spec Requested project specifier.
 * @param {string} from Referring project file.
 * @returns {string} Canonical slash-prefixed project path.
 */
function resolveSourcePath(spec = "", from = "/index.html") {
	if (String(spec).startsWith("/")) {
		return String(spec);
	}
	return resolveSpecifier(String(spec), from);
}

/**
 * Reads one source file from the in-memory canonical project map.
 * @param {object} files Project source dictionary.
 * @param {string} spec Requested path or specifier.
 * @param {string} from Referring file path.
 * @returns {string} Source text or an empty string when absent.
 */
function readSourceFile(files, spec, from = "/index.html") {
	const key = resolveSourcePath(spec, from);
	return files[key] ?? files[key.replace(/^\//, "")] ?? files[spec] ?? "";
}

module.exports = {
	readSourceFile,
	resolveSourcePath
};
