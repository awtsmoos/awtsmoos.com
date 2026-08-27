//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module AssetCopy
 * @description The Awtsmoos lets verified public media enter a newly owned vessel without mutating its source;
 * Awtsmoos.com proves source-post membership, destination ownership, byte policy, lineage, and retry safety on course.
 */
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { verifyAliasOwnership } = require('../alias.js');
const { er } = require('../general.js');
const { DEFAULT_POLICY, validateAsset } = require('./assetPolicy.js');
const { readAssetManifest, writeAssetManifest } = require('./assetManifest.js');
const { aliasAssetFile, publicAssetPath } = require('./assetPaths.js');
const { verifyAssetCopySource } = require('./assetCopySource.js');
const { getAssetManifest, osPaths } = require('./assetUpload.js');

function copiedAssetId({ buffer, sourceAliasId, sourceAssetId, destinationAliasId }) {
	const hash = crypto.createHash('sha256')
		.update(buffer)
		.update(String(sourceAliasId))
		.update(String(sourceAssetId))
		.update(String(destinationAliasId))
		.digest('hex')
		.slice(0, 24);
	return `asset_copy_${hash}`;
}

async function destinationAuthorized({ $i, userid, aliasId }) {
	$i.$_GET = $i.$_GET || {};
	$i.$_POST = $i.$_POST || {};
	$i.request = $i.request || { headers: {} };
	return verifyAliasOwnership(aliasId, $i, userid);
}

async function sourceManifest({ $i, sourceAliasId, sourceAssetId }) {
	const result = await getAssetManifest({ $i, aliasId: sourceAliasId, assetId: sourceAssetId });
	return result?.success || null;
}

function copiedManifest({ $i, source, destinationAliasId, assetId, buffer, kind, provenance }) {
	const storagePath = aliasAssetFile({
		$i,
		aliasId: destinationAliasId,
		kind,
		assetId,
		mime: source.mime,
		originalName: source.originalName
	});
	return {
		id: assetId,
		aliasId: destinationAliasId,
		ownerAlias: destinationAliasId,
		type: kind,
		mime: source.mime,
		size: buffer.length,
		originalName: source.originalName || path.basename(source.storagePath || 'copy.bin'),
		storagePath,
		publicPath: publicAssetPath({ aliasId: destinationAliasId, kind, assetId, mime: source.mime, originalName: source.originalName }),
		...osPaths(destinationAliasId, assetId),
		attachedTo: { kind: 'clone', postId: '', verseId: '', subsectionId: '', commentId: '' },
		bindings: [],
		copiedFrom: { aliasId: source.aliasId, assetId: source.id, publicPath: source.publicPath || '', ...provenance },
		createdAt: Date.now()
	};
}

async function copyAsset(input) {
	const { $i, userid, destinationAliasId, sourceAliasId, sourceAssetId } = input;
	if (!destinationAliasId || !sourceAliasId || !sourceAssetId) {
		return er({ code: 'COPY_SOURCE_REQUIRED', message: 'Source and destination asset coordinates are required.' });
	}
	if (!await destinationAuthorized({ $i, userid, aliasId: destinationAliasId })) {
		return er({ code: 'NOT_AUTHORIZED', message: 'Only the destination alias owner can copy assets here.' });
	}
	const proof = await verifyAssetCopySource(input);
	if (proof?.error) return proof;
	const source = await sourceManifest({ $i, sourceAliasId, sourceAssetId });
	if (!source?.storagePath || !fs.existsSync(source.storagePath)) {
		return er({ code: 'ASSET_SOURCE_MISSING', message: 'The source asset file is unavailable.' });
	}
	const buffer = fs.readFileSync(source.storagePath);
	const valid = validateAsset({ mime: source.mime, size: buffer.length, policy: DEFAULT_POLICY });
	if (valid.error) return er(valid);
	const assetId = copiedAssetId({ buffer, sourceAliasId, sourceAssetId, destinationAliasId });
	const existing = readAssetManifest({ $i, aliasId: destinationAliasId, assetId });
	if (existing?.storagePath && fs.existsSync(existing.storagePath)) return { success: existing, reused: true };
	const provenance = { heichelId: input.sourceHeichelId, seriesId: input.sourceSeriesId || 'root', postId: input.sourcePostId };
	const manifest = copiedManifest({ $i, source, destinationAliasId, assetId, buffer, kind: valid.kind, provenance });
	fs.mkdirSync(path.dirname(manifest.storagePath), { recursive: true });
	fs.writeFileSync(manifest.storagePath, buffer);
	await writeAssetManifest({ $i, manifest });
	return { success: manifest, reused: false };
}

module.exports = { copyAsset, copiedAssetId, copiedManifest };
