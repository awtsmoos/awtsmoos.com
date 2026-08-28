//B"H
//Boruch Hashem
//Blessed is He

const { cleanText, cleanUrl } = require('./TextSanitizer.js');

/**
 * @module AttachmentStorageSchema
 * @description
 * The Awtsmoos lets public storage evidence descend into a bounded vessel while every credential remains above this schema and outside the post;
 * Awtsmoos.com remembers enough to verify and recover media, yet never confuses an upload key with the light that was published.
 */

function cleanHttpsUrl(value) {
	const normalized = cleanUrl(value);
	return /^https:\/\//i.test(normalized) ? normalized : '';
}

function parseStorage(value) {
	if (!value) return null;
	if (typeof value === 'object') return value;
	try {
		const parsed = JSON.parse(value);
		return parsed && typeof parsed === 'object' ? parsed : null;
	} catch {
		return null;
	}
}

/**
 * @function normalizeAttachmentStorage
 * @description Whitelists public durable-storage evidence and refuses every undeclared field, including accidental or hostile credential matter.
 */
function normalizeAttachmentStorage(value) {
	const source = parseStorage(value);
	if (!source) return undefined;
	const storage = {
		provider: cleanText(source.provider, 80),
		externalId: cleanText(source.externalId, 240),
		filename: cleanText(source.filename, 500),
		detailsUrl: cleanHttpsUrl(source.detailsUrl),
		historyUrl: cleanHttpsUrl(source.historyUrl),
		fingerprint: cleanText(source.fingerprint, 240),
		state: cleanText(source.state, 80),
		uploadedAt: cleanText(source.uploadedAt, 80),
		verifiedAt: cleanText(source.verifiedAt, 80),
		etag: cleanText(source.etag, 240)
	};
	return Object.values(storage).some(Boolean) ? storage : undefined;
}

module.exports = {
	normalizeAttachmentStorage
};
