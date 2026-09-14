//B"H
//Boruch Hashem
//Blessed be He

const fs = require("fs");
const path = require("path");

const textExtensions = new Set([
	".css", ".htm", ".html", ".js", ".json", ".mjs", ".svg", ".txt"
]);

/**
 * Reads one source project recursively into canonical slash-prefixed paths.
 * Hidden files, node_modules, git state, and non-text assets are excluded from
 * the transitional source compiler; canonical ASSETS sections will own binary
 * payloads once that compiler stage is activated.
 * @param {string} rootPath Project directory.
 * @returns {object} Path-to-source map.
 */
function readProjectFiles(rootPath) {
	const root = path.resolve(String(rootPath || "."));
	const files = Object.create(null);
	walk(root, root, files);
	return files;
}

/** Recursively walks trusted project-local paths without following symlinks. */
function walk(root, current, output) {
	for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
		if (entry.name.startsWith(".") || entry.name === "node_modules") {
			continue;
		}
		const absolute = path.join(current, entry.name);
		if (entry.isSymbolicLink()) {
			continue;
		}
		if (entry.isDirectory()) {
			walk(root, absolute, output);
			continue;
		}
		if (!entry.isFile() || !textExtensions.has(path.extname(entry.name).toLowerCase())) {
			continue;
		}
		const relative = path.relative(root, absolute).split(path.sep).join("/");
		output[`/${relative}`] = fs.readFileSync(absolute, "utf8");
	}
}

/** Reads canonical bytes from disk without changing them. */
function readMerkavaFile(filePath) {
	return fs.readFileSync(path.resolve(filePath));
}

/** Writes canonical bytes atomically through a sibling temporary file. */
function writeMerkavaFile(filePath, bytes) {
	const destination = path.resolve(filePath);
	fs.mkdirSync(path.dirname(destination), { recursive: true });
	const temporary = `${destination}.tmp-${process.pid}`;
	fs.writeFileSync(temporary, Buffer.from(bytes));
	fs.renameSync(temporary, destination);
	return destination;
}

module.exports = {
	readMerkavaFile,
	readProjectFiles,
	writeMerkavaFile
};
