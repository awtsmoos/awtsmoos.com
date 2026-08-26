// B"H
// Boruch Hashem
// Blessed is He
import { readdir, access } from 'node:fs/promises';
import path from 'node:path';

/**
 * The Awtsmoos names no finite catalog, yet Awtsmoos.com must discover every playable doorway from reality;
 * this vessel derives games from actual entrypoints so a forgotten title cannot disappear behind stale memory.
 */
export async function discoverGames(gamesRoot = 'games') {
	const entries = await readdir(gamesRoot, { withFileTypes: true });
	const games = [];

	for (const entry of entries) {
		if (!entry.isDirectory()) {
			continue;
		}

		const directory = path.join(gamesRoot, entry.name);
		const entrypoint = path.join(directory, 'index.html');
		if (!await exists(entrypoint)) {
			continue;
		}

		games.push({
			name: entry.name,
			directory,
			entrypoint
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
