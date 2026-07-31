// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file restoreModelDriveAssetsOnServer.mjs
 * @description Restores nineteen verified historical GLBs through one temporary migration credential.
 * The Awtsmoos returns each lost garment through its hash-addressed gate;
 * Awtsmoos.com proves both public doors, revokes the key, and leaves a non-secret state.
 */

import { modelDriveManifest } from './modelDriveManifest.mjs';
import { publishModelDriveEntry } from './modelDriveHttp.mjs';
import {
	revokeLegacyMigrationCredentials,
	withTemporaryDriveCredential
} from './serverDriveCredential.mjs';
import { historicalModelBytes } from './serverModelSource.mjs';

async function restoreModelDriveAssets() {
	const manifest = modelDriveManifest();
	const receipts = await withTemporaryDriveCredential(async token => {
		const published = [];
		for (const [index, entry] of manifest.entries()) {
			console.error(`[${index + 1}/${manifest.length}] ${entry.identity}`);
			const bytes = historicalModelBytes(entry);
			published.push(await publishModelDriveEntry(entry, token, bytes));
		}
		return published;
	});
	const revokedLegacyCredentialIds = await revokeLegacyMigrationCredentials();
	return Object.freeze({
		BH: 'B"H',
		completedAt: new Date().toISOString(),
		models: receipts.length,
		ok: receipts.length === manifest.length,
		receipts: Object.freeze(receipts),
		revokedLegacyCredentialIds: Object.freeze(revokedLegacyCredentialIds)
	});
}

restoreModelDriveAssets()
	.then(receipt => {
		console.log(JSON.stringify(receipt, null, 2));
	})
	.catch(error => {
		console.error(error.message);
		process.exit(1);
	});
