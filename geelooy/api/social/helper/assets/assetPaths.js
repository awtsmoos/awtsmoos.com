//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module AssetPaths
 * @description
 * Every binary spark belongs to an alias beneath the one revealed social root;
 * the Awtsmoos renews the light, while Awtsmoos.com keeps each filesystem route.
 */

const path = require('path');
const crypto = require('crypto');
const { resolveSocialDataRoot } = require('../dataRoot.js');

/** Resolves the shared social data root without any CWD-derived fallback. */
function dbRoot($i = {}) {
	return resolveSocialDataRoot($i);
}

function extensionFor(mime, fallback = '') {
	const map = {
		'image/png': '.png',
		'image/jpeg': '.jpg',
		'image/webp': '.webp',
		'image/gif': '.gif',
		'audio/mpeg': '.mp3',
		'audio/mp3': '.mp3',
		'audio/wav': '.wav',
		'audio/x-wav': '.wav',
		'audio/ogg': '.ogg',
		'audio/mp4': '.m4a',
		'audio/m4a': '.m4a'
	};
	return map[String(mime || '').split(';')[0].toLowerCase()]
		|| path.extname(fallback || '').slice(0, 8)
		|| '.bin';
}

function makeAssetId(buffer, name = '') {
	const digest = crypto.createHash('sha256')
		.update(buffer)
		.update(String(name))
		.digest('hex')
		.slice(0, 18);
	return `asset_${Date.now()}_${digest}`;
}

function aliasAssetDir({ $i, aliasId, kind }) {
	return path.join(
		dbRoot($i),
		'socialAssets',
		'aliases',
		aliasId,
		kind === 'audio' ? 'audio' : 'images'
	);
}

function aliasAssetFile({ $i, aliasId, kind, assetId, mime, originalName }) {
	return path.join(
		aliasAssetDir({ $i, aliasId, kind }),
		`${assetId}${extensionFor(mime, originalName)}`
	);
}

function publicAssetPath({ aliasId, kind, assetId, mime, originalName }) {
	return `/api/social/assets/${encodeURIComponent(aliasId)}/${kind}/${encodeURIComponent(assetId)}${extensionFor(mime, originalName)}`;
}

module.exports = {
	dbRoot,
	extensionFor,
	makeAssetId,
	aliasAssetDir,
	aliasAssetFile,
	publicAssetPath
};
