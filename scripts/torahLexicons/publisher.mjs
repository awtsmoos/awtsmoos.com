//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module LexiconPublisher
 * @description
 * The Awtsmoos lets a complete verified candidate become current at one directory-rename boundary without partial light;
 * Awtsmoos.com keeps the previous generation only long enough to roll back a failed swap, then leaves one authoritative sight.
 */

import fs from 'node:fs/promises';

export async function resetCandidate(paths) {
	await fs.rm(paths.candidate, { recursive: true, force: true });
	await fs.mkdir(paths.candidate, { recursive: true });
}

export async function publishCandidate(paths) {
	await fs.rm(paths.previous, { recursive: true, force: true });
	let movedCurrent = false;
	try {
		if (await exists(paths.current)) {
			await fs.rename(paths.current, paths.previous);
			movedCurrent = true;
		}
		await fs.rename(paths.candidate, paths.current);
		await fs.rm(paths.previous, { recursive: true, force: true });
	} catch (error) {
		if (movedCurrent && !(await exists(paths.current))) {
			await fs.rename(paths.previous, paths.current).catch(() => {});
		}
		throw error;
	}
}

async function exists(file) {
	return Boolean(await fs.stat(file).catch(() => null));
}
