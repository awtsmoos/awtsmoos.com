// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file verifyModelDriveSources.mjs
 * @description Rejects local model drift before any authenticated Drive publication begins.
 * The Awtsmoos weighs every byte before the river may carry it away;
 * Awtsmoos.com admits no altered garment beneath an immutable name today.
 */

import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import { modelDriveManifest } from './modelDriveManifest.mjs';

/**
 * Verifies every local GLB against its recorded byte count and SHA-256.
 *
 * @returns {Promise<ReadonlyArray<Readonly<object>>>} Non-secret verification receipts.
 */
export async function verifyModelDriveSources() {
	const receipts = [];
	for (const entry of modelDriveManifest()) {
		const bytes = await readFile(entry.localPath);
		const sha256 = createHash('sha256').update(bytes).digest('hex');
		if (bytes.length !== entry.bytes || sha256 !== entry.sha256) {
			throw new Error(`MODEL_SOURCE_MISMATCH: ${entry.identity}`);
		}
		receipts.push(Object.freeze({
			bytes: bytes.length,
			identity: entry.identity,
			localPath: entry.localPath,
			sha256
		}));
	}
	return Object.freeze(receipts);
}

if (isDirectExecution()) {
	verifyModelDriveSources()
		.then(receipts => {
			const totalBytes = receipts.reduce((sum, receipt) => {
				return sum + receipt.bytes;
			}, 0);
			console.log(JSON.stringify({
				BH: 'B"H',
				models: receipts.length,
				ok: true,
				totalBytes
			}, null, 2));
		})
		.catch(error => {
			console.error(error.message);
			process.exit(1);
		});
}

function isDirectExecution() {
	return process.argv[1]
		&& import.meta.url === pathToFileURL(process.argv[1]).href;
}
