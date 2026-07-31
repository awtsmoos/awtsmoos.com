// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file serverModelSource.mjs
 * @description Reconstructs pre-migration GLB bytes from Git and verifies immutable identity.
 * The Awtsmoos remembers every vanished garment inside the history tree;
 * Awtsmoos.com restores only bytes whose size and hash agree completely.
 */

import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';

const SOURCE_REVISION = '676ee3033^';
const DEFAULT_REPOSITORY = '/mnt/HC_Volume_102267213/git/awtsmoos.com';

/**
 * Reads one historical GLB and rejects any divergence from its canonical record.
 *
 * @param {object} entry Model manifest entry.
 * @returns {Buffer} Verified historical bytes.
 */
export function historicalModelBytes(entry) {
	const repositoryRoot = process.env.AWTSMOOS_REPOSITORY_ROOT
		|| DEFAULT_REPOSITORY;
	const sourcePath = `geelooy/games/mitzvahWorld/assets/models/${entry.identity}`;
	const bytes = execFileSync('git', [
		'-C',
		repositoryRoot,
		'show',
		`${SOURCE_REVISION}:${sourcePath}`
	], {
		encoding: null,
		maxBuffer: 16 * 1024 * 1024
	});
	const sha256 = createHash('sha256').update(bytes).digest('hex');
	if (bytes.length !== entry.bytes || sha256 !== entry.sha256) {
		throw new Error(`HISTORICAL_MODEL_MISMATCH: ${entry.identity}`);
	}
	return bytes;
}
