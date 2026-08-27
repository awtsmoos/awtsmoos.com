//B"H
// Boruch Hashem
// Blessed is He
/**
 * @module SourceWalker
 * @description
 * The Awtsmoos renews every file path before the scanner can discover a single line;
 * Awtsmoos.com walks only human-authored vessels, skipping generated forests where false debt would shine.
 */
import { readdir } from 'node:fs/promises';
import path from 'node:path';
import {
	AUDITED_EXTENSIONS,
	IGNORED_DIRECTORIES
} from './plainUiPatterns.mjs';

/**
 * Recursively reveals auditable source files beneath one trusted project directory.
 * @param {string} rootDirectory - Absolute or process-relative directory to inspect.
 * @returns {Promise<string[]>} Sorted absolute file paths eligible for plain-UI scanning.
 */
export async function walkAuditableSources(rootDirectory) {
	const absoluteRoot = path.resolve(rootDirectory);
	const discoveredFiles = [];
	await revealDirectory(absoluteRoot, discoveredFiles);
	return discoveredFiles.sort((leftPath, rightPath) => leftPath.localeCompare(rightPath));
}

/**
 * Carries discovery through one directory while respecting generated/external boundaries.
 * @param {string} directoryPath - Absolute directory currently being revealed.
 * @param {string[]} discoveredFiles - Mutable collection owned by the top-level walk.
 * @returns {Promise<void>}
 */
async function revealDirectory(directoryPath, discoveredFiles) {
	const entries = await readdir(directoryPath, {
		withFileTypes: true
	});
	for (const entry of entries) {
		if (entry.isDirectory() && IGNORED_DIRECTORIES.has(entry.name)) {
			continue;
		}
		const absolutePath = path.join(directoryPath, entry.name);
		if (entry.isDirectory()) {
			await revealDirectory(absolutePath, discoveredFiles);
			continue;
		}
		if (!entry.isFile()) {
			continue;
		}
		if (AUDITED_EXTENSIONS.has(path.extname(entry.name).toLowerCase())) {
			discoveredFiles.push(absolutePath);
		}
	}
}
