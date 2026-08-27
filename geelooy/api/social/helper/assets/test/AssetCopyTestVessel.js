//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module AssetCopyTestVessel
 * @description The Awtsmoos lets filesystem, ownership, and media policy be tested without borrowing production state;
 * Awtsmoos.com gives voice a local vault while video remains an external sea, so each fixture proves the proper custody gate.
 */
const fs = require('fs');
const os = require('os');
const path = require('path');

function moduleRecord(filename, exports) {
	return { id: filename, filename, loaded: true, exports };
}

function createMediaSource(root, {
	mime = 'audio/webm',
	type = 'audio',
	originalName = 'voice.webm'
} = {}) {
	const storagePath = path.join(root, originalName);
	const bytes = Buffer.from('B\"H living media');
	fs.writeFileSync(storagePath, bytes);
	return {
		bytes,
		manifest: {
			id: 'asset-source',
			aliasId: 'teacher',
			mime,
			type,
			originalName,
			storagePath,
			publicPath: `/api/social/assets/teacher/${type}/asset-source.webm`
		}
	};
}

function createSource(root) {
	return createMediaSource(root);
}

function createVideoSource(root) {
	return createMediaSource(root, {
		mime: 'video/webm',
		type: 'video',
		originalName: 'lesson.webm'
	});
}

function installCopyModule({ sourceManifest, destinationManifests, owns = true }) {
	const aliasPath = require.resolve('../../alias.js');
	const uploadPath = require.resolve('../assetUpload.js');
	const manifestPath = require.resolve('../assetManifest.js');
	const proofPath = require.resolve('../assetCopySource.js');
	require.cache[aliasPath] = moduleRecord(aliasPath, { verifyAliasOwnership: async () => owns });
	require.cache[proofPath] = moduleRecord(proofPath, {
		verifyAssetCopySource: async () => ({ success: { postId: 'source-post' } })
	});
	require.cache[uploadPath] = moduleRecord(uploadPath, {
		getAssetManifest: async () => ({ success: sourceManifest }),
		osPaths: (aliasId, assetId) => ({
			ownerOsPath: `/os/aliases/${aliasId}/assets/${assetId}`,
			virtualOsPath: `/awtsmoos-os/assets/${aliasId}/${assetId}`,
			vaultPath: `/socialAssets/aliases/${aliasId}/${assetId}`
		})
	});
	require.cache[manifestPath] = moduleRecord(manifestPath, {
		readAssetManifest: ({ aliasId, assetId }) => destinationManifests.get(`${aliasId}:${assetId}`) || null,
		writeAssetManifest: async ({ manifest }) => {
			destinationManifests.set(`${manifest.aliasId}:${manifest.id}`, manifest);
			return manifest;
		}
	});
	delete require.cache[require.resolve('../assetCopy.js')];
	return require('../assetCopy.js');
}

function createVessel() {
	const root = fs.mkdtempSync(path.join(os.tmpdir(), 'awtsmoos-copy-'));
	return {
		root,
		$i: { db: { directory: root }, $_GET: {}, $_POST: {}, request: { headers: {} } }
	};
}

module.exports = { createMediaSource, createSource, createVideoSource, createVessel, installCopyModule };
