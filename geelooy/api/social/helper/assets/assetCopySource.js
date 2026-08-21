//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module AssetCopySource
 * @description The Awtsmoos lets a public post testify which media truly belongs to its visible vessel;
 * Awtsmoos.com requires canonical post evidence before cross-alias bytes may enter another vault or level.
 */
const { er } = require('../general.js');
const { readPostRecord } = require('../socialContent.js');

function manifestId(value = {}) {
	const manifest = value.manifest && typeof value.manifest === 'object'
		? value.manifest
		: value;
	return String(manifest.id || manifest.assetId || value.id || value.assetId || '');
}

function collectAssets(record = {}) {
	const assets = [...array(record.rootAssets)];
	for (const section of array(record.sections)) {
		assets.push(...array(section.assets));
		for (const segment of sectionChildren(section)) {
			assets.push(...array(segment.assets));
		}
	}
	return assets;
}

function sectionChildren(section = {}) {
	return [
		...array(section.segments),
		...array(section.subsections)
	];
}

function array(value) {
	return Array.isArray(value) ? value : [];
}

async function verifyAssetCopySource({
	$i,
	sourceHeichelId,
	sourceSeriesId = 'root',
	sourcePostId,
	sourceAliasId,
	sourceAssetId
}) {
	if (!sourceHeichelId || !sourcePostId || !sourceAssetId) {
		return er({ code: 'COPY_SOURCE_CONTEXT_REQUIRED', message: 'Canonical source post coordinates are required.' });
	}
	const post = await readPostRecord({
		$i,
		heichelId: sourceHeichelId,
		postId: sourcePostId
	});
	if (!post) return er({ code: 'COPY_SOURCE_POST_NOT_FOUND', message: 'The source post could not be verified.' });
	if (String(post.seriesId || 'root') !== String(sourceSeriesId || 'root')) {
		return er({ code: 'COPY_SOURCE_SERIES_MISMATCH', message: 'The source series does not match the canonical post.' });
	}
	if (sourceAliasId && post.aliasId && String(post.aliasId) !== String(sourceAliasId)) {
		return er({ code: 'COPY_SOURCE_ALIAS_MISMATCH', message: 'The source alias does not match the canonical post.' });
	}
	const found = collectAssets(post).some(item => manifestId(item) === String(sourceAssetId));
	if (!found) {
		return er({ code: 'ASSET_NOT_IN_SOURCE_POST', message: 'This asset is not part of the canonical source post.' });
	}
	return { success: { postId: post.id || post.postId || sourcePostId } };
}

module.exports = {
	collectAssets,
	manifestId,
	verifyAssetCopySource
};
