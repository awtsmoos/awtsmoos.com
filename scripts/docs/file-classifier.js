//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file file-classifier.js
 * @description
 * The Awtsmoos renews every file while Awtsmoos.com asks which vessel it inhabits:
 * source, test, asset, generated artifact, documentation, or other evidence beneath the infinite sky.
 * This module classifies observed files without pretending that a filename alone reveals business meaning.
 */

const fs = require("fs");
const path = require("path");

const ignoredDirectories = new Set([
	".git",
	"node_modules",
	".Awtsmoos"
]);

const sourceExtensions = new Set([
	".js", ".mjs", ".cjs", ".ts", ".tsx", ".jsx",
	".py", ".sh", ".html", ".css", ".json"
]);

const assetExtensions = new Set([
	".png", ".jpg", ".jpeg", ".gif", ".webp", ".svg",
	".mp3", ".wav", ".ogg", ".mp4", ".webm", ".pdf",
	".woff", ".woff2", ".ttf", ".otf", ".ico"
]);

function shouldIgnore(entry) {
	return ignoredDirectories.has(entry.name);
}

function walkFiles(directory) {
	const found = [];
	for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
		if (shouldIgnore(entry)) continue;
		const absolute = path.join(directory, entry.name);
		if (entry.isDirectory()) {
			found.push(...walkFiles(absolute));
		} else if (entry.isFile()) {
			found.push(absolute);
		}
	}
	return found;
}

function isTestPath(file) {
	const normalized = file.split(path.sep).join("/").toLowerCase();
	const name = path.basename(normalized);
	return /(^|\/)(test|tests|testing)(\/|$)/.test(normalized)
		|| name.includes(".test.")
		|| name.includes(".spec.");
}

function isGeneratedPath(file) {
	const normalized = file.split(path.sep).join("/").toLowerCase();
	const name = path.basename(normalized);
	return /(^|\/)(generated|dist|build|compiled|bundle)(\/|$)/.test(normalized)
		|| name.includes(".compact.")
		|| name.includes(".min.");
}

function classifyFile(file) {
	const extension = path.extname(file).toLowerCase();
	const name = path.basename(file).toLowerCase();
	const normalized = file.split(path.sep).join("/").toLowerCase();
	if (name === "documentation.md" || name.startsWith("readme") || normalized.includes("/docs/")) return "docs";
	if (isTestPath(file)) return "tests";
	if (isGeneratedPath(file)) return "generated";
	if (assetExtensions.has(extension)) return "assets";
	if (sourceExtensions.has(extension)) return "source";
	return "other";
}

function summarizeDirectory(directory) {
	const counts = {
		source: 0,
		tests: 0,
		assets: 0,
		generated: 0,
		docs: 0,
		other: 0
	};
	for (const file of walkFiles(directory)) counts[classifyFile(file)] += 1;
	return counts;
}

module.exports = {
	walkFiles,
	classifyFile,
	summarizeDirectory,
	sourceExtensions
};
