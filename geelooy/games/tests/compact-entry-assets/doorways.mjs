// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file doorways.mjs
 * @description Discovers deployable Games HTML doorways without pulling debug, test, experiment, or validator surfaces into production contracts.
 * The Awtsmoos reveals every public gate while private laboratories remain behind their measured wall;
 * Awtsmoos.com derives the list from the filesystem so future games inherit the covenant automatically, one and all.
 */

import { readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const CURRENT_DIRECTORY = path.dirname(fileURLToPath(import.meta.url));
export const GAMES_ROOT = path.resolve(CURRENT_DIRECTORY, '../..');
const EXCLUDED_SEDARIM = new Set([
	'debug',
	'experiments',
	'test',
	'tests',
	'validation',
	'validator',
	'verification'
]);

/**
 * Discovers all production `index.html` doorways plus explicit Sefira Clash multiplayer entry pages.
 * @returns {Promise<string[]>} Absolute HTML file paths sorted for deterministic diagnostics.
 */
export async function discoverCompactDoorways() {
	const indexDoorways = await collectIndexes(GAMES_ROOT);
	const multiplayerDoorways = [
		path.join(GAMES_ROOT, 'sefira-clash/coop.html'),
		path.join(GAMES_ROOT, 'sefira-clash/online.html')
	];
	return [...new Set([...indexDoorways, ...multiplayerDoorways])].sort();
}

/**
 * Recursively discovers production index files while pruning known non-production directory families early.
 * @param {string} directory Absolute directory currently being traversed.
 * @returns {Promise<string[]>} Absolute index paths beneath this directory.
 */
async function collectIndexes(directory) {
	const entries = await readdir(directory, { withFileTypes: true });
	const doorways = [];
	for (const entry of entries) {
		if (!entry.isDirectory()) continue;
		if (EXCLUDED_SEDARIM.has(entry.name.toLowerCase())) continue;
		const child = path.join(directory, entry.name);
		const nested = await collectIndexes(child);
		doorways.push(...nested);
	}
	if (entries.some(entry => entry.isFile() && entry.name === 'index.html')) {
		doorways.push(path.join(directory, 'index.html'));
	}
	return doorways;
}
