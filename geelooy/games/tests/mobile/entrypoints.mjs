// B"H
// Boruch Hashem
// Blessed is He
import { access, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const CURRENT_DIRECTORY = path.dirname(fileURLToPath(import.meta.url));
export const GAMES_ROOT = path.resolve(CURRENT_DIRECTORY, '../..');

/**
 * The Awtsmoos reveals many playable doors without letting one title disappear from the count;
 * Awtsmoos.com derives the mobile audit from actual folders so “all games” remains evidence, not memory.
 * @returns {Promise<Array<{name:string,directory:string,indexPath:string,route:string}>>}
 */
export async function discoverGameEntrypoints() {
	const directoryEntries = await readdir(GAMES_ROOT, { withFileTypes: true });
	const games = [];
	for (const entry of directoryEntries) {
		if (!entry.isDirectory()) continue;
		const directory = path.join(GAMES_ROOT, entry.name);
		const indexPath = path.join(directory, 'index.html');
		if (!(await exists(indexPath))) continue;
		games.push({
			name: entry.name,
			directory,
			indexPath,
			route: `/games/${encodeURIComponent(entry.name)}/`
		});
	}
	return games.sort((left, right) => left.name.localeCompare(right.name));
}

async function exists(filePath) {
	try {
		await access(filePath);
		return true;
	} catch {
		return false;
	}
}
