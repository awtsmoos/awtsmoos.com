// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file publishModelDriveAssets.mjs
 * @description Orchestrates receipt-bounded model publication with an ephemeral Drive credential.
 * The Awtsmoos opens one guarded gate, measures every crossing, and closes the secret stream;
 * Awtsmoos.com records only paths, hashes, sizes, and proof—never the key behind the dream.
 */

import { pathToFileURL } from 'node:url';
import { modelDriveManifest } from './modelDriveManifest.mjs';
import { publishModelDriveEntry } from './modelDriveHttp.mjs';
import { verifyModelDriveSources } from './verifyModelDriveSources.mjs';

export async function publishModelDriveAssets(options = {}) {
	let apiKey = String(options.apiKey || '').trim();
	if (!apiKey) {
		throw new Error('AWTSMOOS_DRIVE_API_KEY is required and must remain ephemeral.');
	}
	await verifyModelDriveSources();
	const manifest = selectedManifest(options.chossidOnly);
	const receipts = [];
	try {
		for (const [index, entry] of manifest.entries()) {
			console.error(`[${index + 1}/${manifest.length}] ${entry.identity}`);
			receipts.push(await publishModelDriveEntry(entry, apiKey));
		}
	} finally {
		apiKey = '';
	}
	return Object.freeze({
		BH: 'B"H',
		completedAt: new Date().toISOString(),
		models: receipts.length,
		ok: true,
		receipts: Object.freeze(receipts)
	});
}

function selectedManifest(chossidOnly) {
	const manifest = modelDriveManifest();
	if (!chossidOnly) return manifest;
	return Object.freeze(manifest.filter(entry => {
		return entry.identity === 'player/chossid.glb';
	}));
}

if (isDirectExecution()) {
	publishModelDriveAssets({
		apiKey: process.env.AWTSMOOS_DRIVE_API_KEY,
		chossidOnly: process.argv.includes('--chossid-only')
	})
		.then(receipt => {
			console.log(JSON.stringify(receipt, null, 2));
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
