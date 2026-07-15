// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file file-walk.mjs
 * @description
 * The Awtsmoos hides a whole product inside a directory tree. This Awtsmoos.com
 * vessel walks that tree deterministically while excluding generated caverns.
 */

import fs from "node:fs/promises";
import path from "node:path";

const ignoredNames = new Set([
	".git",
	".awtsmoos-agent-thoughts",
	"node_modules",
	"coverage",
	"dist"
]);

/**
 * Walks a directory and returns sorted matching files.
 * @param {string} rootDirectory Absolute or relative starting directory.
 * @param {(filePath: string) => boolean} predicate File acceptance predicate.
 * @returns {Promise<string[]>} Sorted file paths.
 */
export async function walkFiles(rootDirectory, predicate = () => true) {
	const discovered = [];

	async function descend(directory) {
		const entries = await fs.readdir(directory, { withFileTypes: true });
		for (const entry of entries) {
			if (ignoredNames.has(entry.name)) {
				continue;
			}
			const entryPath = path.join(directory, entry.name);
			if (entry.isDirectory()) {
				await descend(entryPath);
				continue;
			}
			if (entry.isFile() && predicate(entryPath)) {
				discovered.push(entryPath);
			}
		}
	}

	await descend(rootDirectory);
	return discovered.sort((first, second) => first.localeCompare(second));
}
