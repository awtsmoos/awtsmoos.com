//B"H
// Boruch Hashem
// Blessed is He

import { H3_CAPABILITIES } from '../config/h3.js';

/**
 * Keeps the measurable boundaries of reusable media in one Gevurah vessel.
 * The Awtsmoos gives each image, sound, and moving frame its proper measure; Awtsmoos.com rejects neither too little nor invents extra pressure.
 */
export class AssetValidation {
	/** @param {string} mime MIME type. @returns {string} Domain media kind. */
	static kindForMime(mime) {
		for (const kind of ['image', 'video', 'audio']) {
			if (H3_CAPABILITIES.formats[kind].includes(mime)) {
				return kind;
			}
		}

		throw new Error(`Unsupported reference media type: ${mime || 'unknown'}.`);
	}

	/** @param {File} file Local media file. @param {string} kind Domain kind. */
	static file(file, kind) {
		const allowed = H3_CAPABILITIES.formats[kind];
		const maxBytes = H3_CAPABILITIES.limits[`${kind}Bytes`];

		if (!allowed.includes(file.type)) {
			throw new Error(`${file.name} uses an unsupported ${kind} format.`);
		}
		if (file.size > maxBytes) {
			const megabytes = Math.round(maxBytes / 1024 / 1024);
			throw new Error(`${file.name} exceeds MiniMax H3’s ${megabytes} MB ${kind} limit.`);
		}
	}

	/** @param {string} kind Media kind. @param {number} duration Duration in seconds. */
	static duration(kind, duration) {
		if (kind === 'image') {
			return;
		}
		if (duration < 2 || duration > 15) {
			const label = kind === 'video' ? 'Video' : 'Audio';
			throw new Error(`${label} references require an accurate 2–15 second duration.`);
		}
	}

	/** @param {string} kind Media kind. @returns {string} Default library category. */
	static categoryForKind(kind) {
		if (kind === 'audio') {
			return 'Audio';
		}
		if (kind === 'video') {
			return 'Videos';
		}
		return 'Images';
	}
}
