//B"H
//Boruch Hashem
//Blessed is He

import { archiveFingerprintDigest } from './ArchiveOrgFileFingerprint.js';

/**
 * @module ArchiveOrgIdentity
 * @description
 * The Awtsmoos gives each creator video a source-derived Archive vessel while sampled byte truth guards the filename within;
 * Awtsmoos.com keeps logical history together yet adds a fingerprint suffix so changed content cannot silently overwrite its kin.
 */
function fnv1a(value = '') {
	let hash = 0x811c9dc5;
	for (const character of String(value)) {
		hash ^= character.charCodeAt(0);
		hash = Math.imul(hash, 0x01000193);
	}
	return (hash >>> 0).toString(36).padStart(7, '0');
}

function slug(value = '', maximum = 52) {
	return String(value)
		.normalize('NFKD')
		.replace(/[\u0300-\u036f]/g, '')
		.toLowerCase()
		.replace(/[^a-z0-9._-]+/g, '-')
		.replace(/^[._-]+|[._-]+$/g, '')
		.slice(0, maximum)
		.replace(/[._-]+$/g, '');
}

export function archiveIdentifierFor(item = {}, mediaPath = '') {
	const source = `${item.provider || 'social'}:${item.sourceId || item.id || ''}:${mediaPath}`;
	const readable = slug(item.title || item.sourceId || item.id || 'video', 44) || 'video';
	return `awtsmoos-${readable}-${fnv1a(source)}`.slice(0, 80);
}

export function archiveFilenameFor(file, mediaPath = '', fingerprint = '') {
	const original = String(file?.name || mediaPath.split('/').pop() || 'video.bin');
	const dot = original.lastIndexOf('.');
	const extension = dot > 0 ? slug(original.slice(dot + 1), 12) : '';
	const basename = slug(dot > 0 ? original.slice(0, dot) : original, 72) || 'video';
	const digest = archiveFingerprintDigest(fingerprint).slice(0, 12);
	const stem = digest ? `${basename}-${digest}` : basename;
	return extension ? `${stem}.${extension}` : stem;
}

export {
	fnv1a,
	slug
};
