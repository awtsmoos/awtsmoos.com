// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EssentialReleaseAssetBuilder.cjs
 * @description Packages every first-play essential remote asset into the release after verifying immutable byte identity.
 * The Awtsmoos lets distant garments descend once into one bounded release vessel;
 * Awtsmoos.com proves source, bytes, and hash before grass or Chossid may become local, so speed never trades away identity.
 */

const crypto = require('node:crypto');
const fs = require('node:fs/promises');
const path = require('node:path');

const CHOSSID_SHA = 'd86fd3289c3d12ac566fe8aa7bed37244e352043ee821a0c43b47055ce8ebe48';
const ASSETS = Object.freeze({
	canonicalChossid: Object.freeze({
		bytes: 2027368,
		fileName: `${CHOSSID_SHA}/chossid.glb`,
		publicUrl: `/games/mitzvahWorld/build/generated/assets/${CHOSSID_SHA}/chossid.glb`,
		sha256: CHOSSID_SHA,
		sourceUrl: `https://awtsmoos.com/sites/firebase_drive_migration/assets/mitzvah-world/models/player/${CHOSSID_SHA}/chossid.glb`
	}),
	essentialGrass: Object.freeze({
		bytes: 322486,
		fileName: 'essential-grass.jpg',
		publicUrl: '/games/mitzvahWorld/build/generated/assets/essential-grass.jpg',
		sha256: '632d94c4225546aa57db7b75b3f6819c4cc95343b4b7add5ada44688f8722942',
		sourceUrl: 'https://awtsmoos.com/sites/firebase_drive_migration/awtsmoos-nature/chai-forest/textures/ground/grass.jpg'
	})
});

/** Downloads, verifies, and publishes every essential release-owned asset plus one custody manifest. */
async function buildEssentialReleaseAssets(gameRoot) {
	const generatedRoot = path.join(gameRoot, 'build/generated');
	const assetRoot = path.join(generatedRoot, 'assets');
	await fs.mkdir(assetRoot, { recursive: true });
	const assets = {};
	for (const [name, definition] of Object.entries(ASSETS)) {
		assets[name] = await packageEssentialAsset(assetRoot, definition);
	}
	const manifest = Object.freeze({
		assets: Object.freeze(assets),
		version: 2
	});
	await fs.writeFile(
		path.join(generatedRoot, 'mitzvah-world-essential-assets.json'),
		`${JSON.stringify(manifest, null, '\t')}\n`,
		'utf8'
	);
	return manifest;
}

/** Verifies remote bytes against their pinned release identity before publishing locally. */
async function packageEssentialAsset(assetRoot, definition) {
	const response = await fetch(definition.sourceUrl, { cache: 'no-store', redirect: 'follow' });
	if (!response.ok) throw new Error(`ESSENTIAL_ASSET_DOWNLOAD_FAILED:${response.status}:${definition.sourceUrl}`);
	const bytes = Buffer.from(await response.arrayBuffer());
	const sha256 = crypto.createHash('sha256').update(bytes).digest('hex');
	if (bytes.length !== definition.bytes) {
		throw new Error(`ESSENTIAL_ASSET_SIZE_MISMATCH:${bytes.length}:${definition.bytes}:${definition.sourceUrl}`);
	}
	if (sha256 !== definition.sha256) {
		throw new Error(`ESSENTIAL_ASSET_HASH_MISMATCH:${sha256}:${definition.sha256}:${definition.sourceUrl}`);
	}
	const outputPath = path.join(assetRoot, definition.fileName);
	await fs.mkdir(path.dirname(outputPath), { recursive: true });
	await fs.writeFile(outputPath, bytes);
	return Object.freeze({
		bytes: bytes.length,
		publicUrl: definition.publicUrl,
		sha256,
		sourceUrl: definition.sourceUrl
	});
}

module.exports = {
	ASSETS,
	buildEssentialReleaseAssets
};
