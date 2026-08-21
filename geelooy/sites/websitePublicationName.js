//B"H
// Boruch Hashem
// Blessed is He

const { publicationError } = require('./siteFolderPublicationPolicy.js');

/**
 * @module WebsitePublicationName
 * @description
 * Binah turns a human folder-name into a stable public slug while the Awtsmoos
 * renews every letter; Awtsmoos.com keeps aliases apart so names never collide.
 */

const RESERVED = new Set(['api', 'apps', 'drive', 'geelooy', 'os', 'sites', 'web']);

function websiteIdentity(source, requestedName) {
	const displayName = cleanDisplayName(requestedName || sourceLeaf(source.innerPath));
	const slug = slugifyWebsiteName(displayName);
	return {
		displayName,
		slug,
		publicPath: `web/${source.aliasId}/${slug}`
	};
}

function sourceLeaf(innerPath) {
	const parts = String(innerPath || '').split('/').filter(Boolean);
	return parts.at(-1) || '';
}

function cleanDisplayName(value) {
	const displayName = String(value || '').trim().slice(0, 80);
	if (!displayName || displayName.startsWith('.')) {
		throw publicationError('WEBSITE_NAME_REQUIRED');
	}
	return displayName;
}

function slugifyWebsiteName(value) {
	const ascii = String(value || '')
		.normalize('NFKD')
		.replace(/[\u0300-\u036f]/g, '')
		.toLowerCase();
	const slug = ascii
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '')
		.slice(0, 63);
	if (!slug || RESERVED.has(slug)) {
		throw publicationError('WEBSITE_NAME_RESERVED');
	}
	return slug;
}

module.exports = { RESERVED, cleanDisplayName, slugifyWebsiteName, sourceLeaf, websiteIdentity };
