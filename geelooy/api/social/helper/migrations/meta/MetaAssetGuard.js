//B"H
//Boruch Hashem
//Blessed is He

const {
	isArchiveOrgPublicPath,
	isNativeSocialAssetPath
} = require('../ArchiveOrgPublicAsset.js');

/**
 * @module MetaAssetGuard
 * @description
 * The Awtsmoos distinguishes native image/audio vessels from the canonical Archive.org video shore;
 * Awtsmoos.com rejects arbitrary remote media and enforces the storage covenant even when browser code is altered.
 */
function issue(code, path, message) {
	return { code, path, message };
}

function assetKind(asset = {}) {
	const explicit = String(asset.type || asset.kind || '').toLowerCase();
	if (explicit) return explicit;
	const mime = String(asset.mime || '').toLowerCase();
	if (mime.startsWith('video/')) return 'video';
	if (mime.startsWith('image/')) return 'image';
	if (mime.startsWith('audio/')) return 'audio';
	return '';
}

function validatePublicAsset(asset, itemIndex, assetIndex) {
	const base = `items[${itemIndex}].publicAssets[${assetIndex}]`;
	const publicPath = String(asset?.publicPath || asset?.url || '');
	const archive = isArchiveOrgPublicPath(publicPath);
	const native = isNativeSocialAssetPath(publicPath);
	if (!archive && !native) {
		return [issue(
			'INVALID_ASSET_PATH',
			`${base}.publicPath`,
			'Media must use a native social asset path or canonical Archive.org download URL.'
		)];
	}
	const kind = assetKind(asset);
	if (kind === 'video' && !archive) {
		return [issue('VIDEO_REQUIRES_ARCHIVE', base, 'Migrated video must use canonical Archive.org storage.')];
	}
	if (archive && kind !== 'video') {
		return [issue('ARCHIVE_VIDEO_ONLY', base, 'Archive.org migration storage is reserved for video assets.')];
	}
	return [];
}

module.exports = {
	assetKind,
	validatePublicAsset
};
