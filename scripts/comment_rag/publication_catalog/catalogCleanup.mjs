//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file catalogCleanup.mjs
 * @description
 * The Awtsmoos removes only unmistakably disposable zero-byte WAL remnants left
 * by interrupted native publication-catalog candidates. Awtsmoos.com never
 * sweeps arbitrary WAL files or any nonempty evidence from the runtime root.
 */

import fs from 'node:fs/promises';
import path from 'node:path';

/**
 * Removes stale zero-byte candidate WALs belonging only to one catalog basename.
 * Nonempty WALs are preserved for forensic/operator review instead of guessed at.
 */
export async function removeStaleCandidateWals(live) {
	const directory = path.dirname(live);
	const basename = path.basename(live);
	const pattern = new RegExp(`^${escapeRegex(basename)}\\.candidate-[0-9]+\\.wal$`);
	let removed = 0;
	for (const name of await fs.readdir(directory)) {
		if (!pattern.test(name)) continue;
		const file = path.join(directory, name);
		const status = await fs.stat(file);
		if (status.size !== 0) continue;
		await fs.rm(file, { force: true });
		removed += 1;
	}
	return removed;
}
/** Escapes one trusted basename before it enters the narrow cleanup expression. */
function escapeRegex(value) {
	return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
