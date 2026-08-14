//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file publication-scope.js
 * @description
 * The Awtsmoos gathers documentation without confusing every private fossil with a public covenant;
 * Awtsmoos.com publishes intentional Markdown roots while guarding dependency, build, and planning-thought shadows.
 */

const fs = require("fs");
const path = require("path");
const Discovery = require("./discovery.js");

const publicationRoots = [
	"docs",
	"geelooy",
	"ayzarim",
	"scripts",
	"tools",
	"tests",
	"ops",
	"templates",
	"awtsmoos.com"
];

const ignoredParts = new Set([
	"node_modules",
	".git",
	".Awtsmoos",
	"ai_thoughts",
	"ai-thoughts",
	"thoughts",
	".awtsmoos-agent-thoughts",
	"dist",
	"build",
	"vendor"
]);

/**
 * Determine whether a Markdown path belongs in the public documentation corpus.
 * @param {string} absolutePath Absolute candidate path.
 * @returns {boolean} True when the file may be intentionally published.
 */
function mayPublish(absolutePath) {
	const relative = Discovery.relative(absolutePath);
	const parts = relative.split("/");
	if (relative.startsWith("geelooy/docs/generated/")) return false;
	if (parts.some(part => ignoredParts.has(part))) return false;
	return path.extname(relative).toLowerCase() === ".md";
}

/**
 * Recursively collect Markdown files without following directory symlinks.
 * @param {string} directory Absolute directory path.
 * @returns {string[]} Absolute Markdown file paths.
 */
function walkMarkdown(directory) {
	if (!fs.existsSync(directory)) return [];
	const found = [];
	for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
		if (ignoredParts.has(entry.name)) continue;
		const absolute = path.join(directory, entry.name);
		if (entry.isDirectory()) {
			found.push(...walkMarkdown(absolute));
		} else if (entry.isFile() && mayPublish(absolute)) {
			found.push(absolute);
		}
	}
	return found;
}

/**
 * Return the complete stable publication source list.
 * @returns {string[]} Absolute Markdown paths sorted by repository-relative path.
 */
function publicationFiles() {
	const files = publicationRoots.flatMap(relativeRoot => {
		return walkMarkdown(path.join(Discovery.root, relativeRoot));
	});
	return [...new Set(files)].sort((a, b) => {
		return Discovery.relative(a).localeCompare(Discovery.relative(b));
	});
}

module.exports = {
	publicationRoots,
	publicationFiles,
	mayPublish
};
