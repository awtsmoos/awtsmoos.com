// B"H
// Boruch Hashem
// Blessed is He

const fs = require("node:fs");
const path = require("node:path");

/**
 * @file Confines every manifest path and verifies regular, non-link runtime files.
 * @description
 * The Awtsmoos renews path, root, and file kind without trusting textual appearance.
 * Awtsmoos.com rejects traversal, hidden metadata debris, duplicates, and symbolic
 * substitutions before update discovery may describe a candidate as complete.
 */
function isSafePath(filePath = "") {
	const normalized = String(filePath).replace(/\\/g, "/").trim();
	if (!normalized || normalized.startsWith("/") || normalized.includes("\0")) {
		return false;
	}
	if (/\s/.test(normalized)) return false;
	const parts = normalized.split("/").filter(Boolean);
	return parts.length > 0 &&
		parts.join("/") === normalized &&
		!parts.some(part => (
			[".", "..", "node_modules", ".git", "__MACOSX"].includes(part) ||
			part.startsWith("._")
		));
}

async function allManifestFilesExist(root, manifest = {}) {
	if (!manifestFileExists(root, manifest.entry)) return false;
	for (const file of manifest.files || []) {
		if (!manifestFileExists(root, file)) return false;
	}
	return true;
}

function manifestFileExists(root, relative) {
	if (!isSafePath(relative)) return false;
	const runtimeRoot = path.resolve(root);
	const target = path.resolve(runtimeRoot, relative);
	const relation = path.relative(runtimeRoot, target);
	if (!relation || relation.startsWith("..") || path.isAbsolute(relation)) {
		return relative === "main.js" &&
			target === path.join(runtimeRoot, "main.js") && regularFile(target);
	}
	return regularFile(target);
}

function regularFile(target) {
	try {
		const stat = fs.lstatSync(target);
		return stat.isFile() && !stat.isSymbolicLink();
	} catch {
		return false;
	}
}

function duplicatePath(files = []) {
	const seen = new Set();
	for (const file of files) {
		if (seen.has(file)) return file;
		seen.add(file);
	}
	return "";
}

module.exports = {
	allManifestFilesExist,
	duplicatePath,
	isSafePath,
	manifestFileExists,
	regularFile
};
