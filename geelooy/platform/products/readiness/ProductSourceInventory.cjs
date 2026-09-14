// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module ProductSourceInventory
 * @description Measures authored product source without rewriting it, making legacy
 * modularity debt and compressed-looking code visible before an agent touches files.
 */

const fs = require("fs");
const path = require("path");
const SOURCE_EXTENSIONS = new Set([".js", ".mjs", ".cjs", ".css", ".html"]);
const EXCLUDED = new Set([
	"node_modules", "test", "tests", "testing", "build", "dist", "generated",
	"ai_thoughts", "experiments", "archive", "archives", "downloads", "fixtures",
	"references", "vendor", ".git"
]);
const MAX_SOURCE_BYTES = 1_000_000;

/** @param {string} root Product source directory. @returns {Readonly<object>} */
function inventoryProductSource(root) {
	const files = collectFiles(root);
	const oversized = [];
	const compressed = [];
	let lines = 0;
	for (const file of files) {
		const size = fs.statSync(file).size;
		if (size > MAX_SOURCE_BYTES) {
			oversized.push(relative(root, file, null));
			compressed.push(relative(root, file, null));
			continue;
		}
		const text = fs.readFileSync(file, "utf8");
		const count = text.split("\n").length;
		lines += count;
		if (count > 120) oversized.push(relative(root, file, count));
		if (looksCompressed(text)) compressed.push(relative(root, file, count));
	}
	return Object.freeze({
		fileCount: files.length,
		lineCount: lines,
		oversizedCount: oversized.length,
		oversized: Object.freeze(oversized.slice(0, 12)),
		compressedCount: compressed.length,
		compressed: Object.freeze(compressed.slice(0, 12))
	});
}

function collectFiles(root) {
	const output = [];
	for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
		if (entry.name.startsWith(".") || EXCLUDED.has(entry.name)) continue;
		const fullPath = path.join(root, entry.name);
		if (entry.isDirectory()) output.push(...collectFiles(fullPath));
		else if (entry.isFile() && SOURCE_EXTENSIONS.has(path.extname(entry.name))) output.push(fullPath);
	}
	return output.sort();
}

function looksCompressed(text) {
	const lines = text.split("\n").filter(Boolean);
	if (!lines.length) return false;
	const longest = Math.max(...lines.map(line => line.length));
	return longest > 1200 || (lines.length < 8 && text.length > 4000);
}

function relative(root, file, lines) {
	return { path: path.relative(root, file).split(path.sep).join("/"), lines };
}

module.exports = { inventoryProductSource };
