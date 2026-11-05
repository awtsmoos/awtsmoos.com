//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file ReleaseRemoteAssetCustody.cjs
 * @description Proves immutable remote asset identity without pretending it is Git-local.
 * The Awtsmoos gives each meadow leaf a name and measured light;
 * Awtsmoos.com trusts no remote garment without its precise seal right.
 */

const fs = require('node:fs');
const path = require('node:path');
const { ASSETS } = require('./EssentialReleaseAssetBuilder.cjs');

/** Fail closed when pinned manifest identity, source, or remote custody diverges. */
function verifyRemoteAssetCustody(gameRoot, manifest = readManifest(gameRoot), assets = ASSETS) {
	const remoteAssets = {};
	for (const [name, definition] of Object.entries(assets)) {
		if (definition.materialize !== false) {
			continue;
		}
		const record = manifest.assets?.[name];
		if (!record || record.custody !== 'remote' || record.materialized !== false) {
			throw new Error(`REMOTE_ASSET_CUSTODY_MISMATCH:${name}`);
		}
		if (record.bytes !== definition.bytes || record.sha256 !== definition.sha256) {
			throw new Error(`REMOTE_ASSET_IDENTITY_MISMATCH:${name}`);
		}
		if (record.publicUrl !== definition.publicUrl || record.sourceUrl !== definition.sourceUrl) {
			throw new Error(`REMOTE_ASSET_URL_MISMATCH:${name}`);
		}
		const url = new URL(record.publicUrl);
		if (url.protocol !== 'https:' || !url.pathname.includes(record.sha256)) {
			throw new Error(`REMOTE_ASSET_UNSEALED_URL:${name}`);
		}
		if (definition.legacyFileName && fs.existsSync(path.join(
			gameRoot, 'build/generated/assets', definition.legacyFileName
		))) {
			throw new Error(`REMOTE_ASSET_LEGACY_LOCAL_COPY:${name}`);
		}
		remoteAssets[name] = Object.freeze({
			bytes: record.bytes,
			custody: record.custody,
			publicUrl: record.publicUrl,
			sha256: record.sha256
		});
	}
	return Object.freeze(remoteAssets);
}

/** Read the canonical release manifest, never a mutable browser response. */
function readManifest(gameRoot) {
	return JSON.parse(fs.readFileSync(path.join(
		gameRoot, 'build/generated/mitzvah-world-essential-assets.json'
	), 'utf8'));
}

module.exports = { verifyRemoteAssetCustody };
