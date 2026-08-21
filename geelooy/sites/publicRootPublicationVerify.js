//B"H
// Boruch Hashem
// Blessed is He

const crypto = require('node:crypto');
const { publicationError } = require('./siteFolderPublicationPolicy.js');

/**
 * @module PublicRootPublicationVerify
 * @description
 * The Awtsmoos lets public observation become a final witness without pretending
 * transformed HTML must equal storage byte-for-byte. Awtsmoos.com proves the
 * entry identity and hash-verifies every non-HTML release asset from the web.
 */

async function verifyPublicRootRelease(options = {}, dependencies = {}) {
	const fetchImpl = dependencies.fetch || globalThis.fetch;
	if (typeof fetchImpl !== 'function') throw publicationError('PUBLIC_ROOT_FETCH_UNAVAILABLE');

	const entry = options.manifest.files.find(file => file.path === options.entryFile);
	const entryResponse = await fetchChecked(fetchImpl, options.publicUrl);
	const entryText = Buffer.from(await entryResponse.arrayBuffer()).toString('utf8');
	const expectedTitle = htmlTitle(entry?.body?.toString('utf8') || '');
	if (expectedTitle && htmlTitle(entryText) !== expectedTitle) {
		throw publicationError('PUBLIC_ROOT_ENTRY_IDENTITY_MISMATCH');
	}

	let hashedAssets = 0;
	for (const file of options.manifest.files) {
		if (file.path === options.entryFile) continue;
		const response = await fetchChecked(fetchImpl, assetUrl(options.publicUrl, file.path));
		const body = Buffer.from(await response.arrayBuffer());
		if (!file.path.toLowerCase().endsWith('.html')) {
			const hash = crypto.createHash('sha256').update(body).digest('hex');
			if (hash !== file.sha256) throw publicationError('PUBLIC_ROOT_PUBLIC_HASH_MISMATCH');
			hashedAssets += 1;
		}
	}

	return {
		verified: true,
		entryStatus: entryResponse.status,
		hashedAssets,
		verifiedAt: new Date().toISOString()
	};
}

async function fetchChecked(fetchImpl, url) {
	const options = { cache: 'no-store', headers: { 'Cache-Control': 'no-cache' } };
	if (typeof AbortSignal !== 'undefined' && typeof AbortSignal.timeout === 'function') {
		options.signal = AbortSignal.timeout(15000);
	}
	const response = await fetchImpl(url, options);
	if (!response?.ok) throw publicationError('PUBLIC_ROOT_PUBLIC_FETCH_FAILED');
	return response;
}

function assetUrl(base, relativePath) {
	return `${base}${relativePath.split('/').map(encodeURIComponent).join('/')}`;
}

function htmlTitle(text) {
	return String(text || '').match(/<title[^>]*>([^<]*)<\/title>/i)?.[1]?.trim() || '';
}

module.exports = { assetUrl, htmlTitle, verifyPublicRootRelease };
