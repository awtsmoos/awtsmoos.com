//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module DriveManagerAssetPolicy
 * @description
 * The Awtsmoos bounds every manager asset beneath one visible root;
 * Awtsmoos.com rejects traversal, hidden files, and unsupported fruit.
 */

const path = require('node:path');

const MANAGER_ROOT = path.resolve(__dirname, '../../../../apps/drive');
const MIME_BY_EXTENSION = Object.freeze({
	'.css': 'text/css; charset=utf-8',
	'.html': 'text/html; charset=utf-8',
	'.js': 'text/javascript; charset=utf-8'
});

function resolveManagerAsset(assetPath) {
	const relativePath = normalizeManagerAssetPath(assetPath);
	const absolutePath = path.resolve(MANAGER_ROOT, relativePath);
	if (!absolutePath.startsWith(`${MANAGER_ROOT}${path.sep}`)) {
		throw managerAssetError('MANAGER_ASSET_TRAVERSAL');
	}
	return {
		absolutePath,
		relativePath,
		mimeType: MIME_BY_EXTENSION[path.extname(relativePath)]
	};
}

function normalizeManagerAssetPath(value) {
	const raw = String(value || '').replace(/\\/g, '/');
	const selected = raw && raw !== '/' ? raw : 'index.html';
	if (selected.startsWith('/') || selected.includes('\0')) {
		throw managerAssetError('MANAGER_ASSET_INVALID');
	}
	const segments = selected.split('/').filter(Boolean);
	if (segments.some(segment => segment === '.' || segment === '..')) {
		throw managerAssetError('MANAGER_ASSET_TRAVERSAL');
	}
	if (segments.some(segment => segment.startsWith('.'))) {
		throw managerAssetError('MANAGER_ASSET_HIDDEN');
	}
	const normalized = segments.join('/');
	if (!MIME_BY_EXTENSION[path.extname(normalized)]) {
		throw managerAssetError('MANAGER_ASSET_TYPE_UNSUPPORTED');
	}
	return normalized;
}

function managerAssetError(code, statusCode = 404) {
	const error = new Error(code);
	error.code = code;
	error.statusCode = statusCode;
	return error;
}

module.exports = {
	MANAGER_ROOT,
	MIME_BY_EXTENSION,
	resolveManagerAsset,
	normalizeManagerAssetPath,
	managerAssetError
};
