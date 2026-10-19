// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EssentialReleaseAssetBuilder.cjs
 * @description Packages first-play essentials from verified local custody before any remote fallback.
 * The Awtsmoos gathers distant and nearby garments into one measured release vessel;
 * Awtsmoos.com trusts neither path nor promise without byte count and hash, so every essential remains level.
 */

const crypto = require('node:crypto');
const fs = require('node:fs/promises');
const path = require('node:path');

const CHOSSID_SHA = 'd86fd3289c3d12ac566fe8aa7bed37244e352043ee821a0c43b47055ce8ebe48';
const ASSETS = Object.freeze({
	canonicalChossid: Object.freeze({
		bytes: 2027368,
		fileName: `${CHOSSID_SHA}/chossid.glb`,
		localFile: `assets/models/player/${CHOSSID_SHA}/chossid.glb`,
		publicUrl: `/games/mitzvahWorld/build/generated/assets/${CHOSSID_SHA}/chossid.glb`,
		sha256: CHOSSID_SHA,
		sourceUrl: `https://awtsmoos.com/games/mitzvahWorld/build/generated/assets/${CHOSSID_SHA}/chossid.glb`
	}),
	essentialGrass: Object.freeze({
		bytes: 322486,
		fileName: 'essential-grass.jpg',
		localFile: 'build/generated/assets/essential-grass.jpg',
		publicUrl: '/games/mitzvahWorld/build/generated/assets/essential-grass.jpg',
		sha256: '632d94c4225546aa57db7b75b3f6819c4cc95343b4b7add5ada44688f8722942',
		sourceUrl: 'https://awtsmoos.com/api/social/drive/public/awtsmoos/textures/essential-grass.jpg'
	})
});

/** Verifies and publishes every essential release-owned asset plus one custody manifest. */
async function buildEssentialReleaseAssets(gameRoot) {
	const generatedRoot = path.join(gameRoot, 'build/generated');
	const assetRoot = path.join(generatedRoot, 'assets');
	await fs.mkdir(assetRoot, { recursive: true });
	const assets = {};
	for (const [name, definition] of Object.entries(ASSETS)) {
		assets[name] = await packageEssentialAsset(gameRoot, assetRoot, definition);
	}
	const manifest = Object.freeze({ assets: Object.freeze(assets), version: 3 });
	await fs.writeFile(
		path.join(generatedRoot, 'mitzvah-world-essential-assets.json'),
		`${JSON.stringify(manifest, null, '\t')}\n`,
		'utf8'
	);
	return manifest;
}

/** Loads canonical bytes from local custody when declared, otherwise from the pinned remote source. */
async function packageEssentialAsset(gameRoot, assetRoot, definition) {
	const source = await loadEssentialBytes(gameRoot, definition);
	const sha256 = crypto.createHash('sha256').update(source.bytes).digest('hex');
	assertEssentialIdentity(source.bytes, sha256, definition, source.label);
	const outputPath = path.join(assetRoot, definition.fileName);
	await fs.mkdir(path.dirname(outputPath), { recursive: true });
	await fs.writeFile(outputPath, source.bytes);
	return Object.freeze({
		bytes: source.bytes.length,
		custody: source.custody,
		publicUrl: definition.publicUrl,
		sha256,
		sourceUrl: definition.sourceUrl
	});
}

async function loadEssentialBytes(gameRoot, definition) {
	if (definition.localFile) {
		const localPath = path.join(gameRoot, definition.localFile);
		try {
			return { bytes: await fs.readFile(localPath), custody: 'local', label: localPath };
		} catch (error) {
			if (error?.code !== 'ENOENT') throw error;
		}
	}
	const response = await fetch(definition.sourceUrl, { cache: 'no-store', redirect: 'follow' });
	if (!response.ok) throw new Error(`ESSENTIAL_ASSET_DOWNLOAD_FAILED:${response.status}:${definition.sourceUrl}`);
	return {
		bytes: Buffer.from(await response.arrayBuffer()),
		custody: 'remote',
		label: definition.sourceUrl
	};
}

function assertEssentialIdentity(bytes, sha256, definition, sourceLabel) {
	if (bytes.length !== definition.bytes) {
		throw new Error(`ESSENTIAL_ASSET_SIZE_MISMATCH:${bytes.length}:${definition.bytes}:${sourceLabel}`);
	}
	if (sha256 !== definition.sha256) {
		throw new Error(`ESSENTIAL_ASSET_HASH_MISMATCH:${sha256}:${definition.sha256}:${sourceLabel}`);
	}
}

module.exports = { ASSETS, buildEssentialReleaseAssets };
