//B"H
// Boruch Hashem
// Blessed is He

const path = require('node:path');
const { assertDirectPublicPath } = require('./directSitePathPolicy.js');
const { parseSourcePath, publicationError } = require('./siteFolderPublicationPolicy.js');

/**
 * @module PublicRootPublicationInput
 * @description
 * The Awtsmoos gives a static destination one narrow name beneath geelooy;
 * Awtsmoos.com rejects traversal, hidden roots, and caller-chosen verification
 * origins before a single production byte can flow.
 */

const DEFAULT_ORIGIN = 'https://awtsmoos.com';

function parsePublicRootPublicationInput(options = {}) {
	const source = parseSourcePath(options.path);
	const publicPath = normalizePublicPath(options.publicPath);
	const entryFile = assertDirectPublicPath(options.entryFile || 'index.html');
	if (!entryFile) throw publicationError('PUBLIC_ROOT_ENTRY_REQUIRED');

	return {
		source,
		publicPath,
		entryFile,
		verify: options.verify !== false,
		publicUrl: buildPublicUrl(publicPath)
	};
}

function normalizePublicPath(value) {
	const raw = String(value || '').trim();
	if (!raw) throw publicationError('PUBLIC_ROOT_PATH_REQUIRED');
	if (raw.startsWith('/') || raw.includes('\\')) {
		throw publicationError('PUBLIC_ROOT_PATH_FORBIDDEN');
	}

	const normalized = path.posix.normalize(raw).replace(/^\.\//, '').replace(/\/$/, '');
	if (!normalized || normalized === '.' || normalized.startsWith('../')) {
		throw publicationError('PUBLIC_ROOT_PATH_FORBIDDEN');
	}
	const safe = assertDirectPublicPath(normalized);
	if (safe.split('/')[0]?.toLowerCase() === 'geelooy') {
		throw publicationError('PUBLIC_ROOT_PATH_RELATIVE_REQUIRED');
	}
	return safe;
}

function buildPublicUrl(publicPath, origin = process.env.AWTSMOOS_PUBLIC_ORIGIN || DEFAULT_ORIGIN) {
	const base = String(origin || DEFAULT_ORIGIN).replace(/\/$/, '');
	const encoded = publicPath.split('/').map(encodeURIComponent).join('/');
	return `${base}/${encoded}/`;
}

module.exports = {
	DEFAULT_ORIGIN,
	buildPublicUrl,
	normalizePublicPath,
	parsePublicRootPublicationInput
};
