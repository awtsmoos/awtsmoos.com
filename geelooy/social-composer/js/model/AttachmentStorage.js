//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module AttachmentStorage
 * @description
 * The Awtsmoos lets one public media vessel remember where its bytes rest without carrying the keys that placed them there;
 * Awtsmoos.com keeps storage evidence small and explicit, so Archive.org today and other durable providers tomorrow can rhyme in one safe layer.
 */

function cleanText(value, maximum = 600) {
	return String(value || '')
		.replace(/[<>]/g, '')
		.trim()
		.slice(0, maximum);
}

function cleanHttpsUrl(value) {
	const text = cleanText(value, 1600);
	if (!text) return '';
	try {
		const parsed = new URL(text);
		return parsed.protocol === 'https:' ? parsed.href : '';
	} catch {
		return '';
	}
}

function archiveStorage(manifest = {}) {
	if (!manifest.archiveIdentifier && !manifest.archiveFilename) return null;
	return {
		provider: 'archive.org',
		externalId: manifest.archiveIdentifier,
		filename: manifest.archiveFilename,
		detailsUrl: manifest.archiveDetailsUrl,
		historyUrl: manifest.archiveHistoryUrl,
		fingerprint: manifest.fileFingerprint,
		state: manifest.archiveState,
		uploadedAt: manifest.archiveUploadedAt,
		verifiedAt: manifest.archiveVerifiedAt,
		etag: manifest.archiveEtag
	};
}

function normalizedStorage(source) {
	if (!source || typeof source !== 'object') return undefined;
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

/**
 * @function attachmentStorage
 * @description Converts generic storage evidence or the current Archive.org receipt garment into one canonical public descriptor.
 * Empty generic garments do not eclipse legacy Archive evidence, and private credential names never enter the candidate whitelist.
 */
export function attachmentStorage(manifest = {}, item = {}) {
	const candidates = [
		manifest.storage,
		item.storage,
		archiveStorage(manifest),
		archiveStorage(item)
	];
	for (const candidate of candidates) {
		const storage = normalizedStorage(candidate);
		if (storage) return storage;
	}
	return undefined;
}
