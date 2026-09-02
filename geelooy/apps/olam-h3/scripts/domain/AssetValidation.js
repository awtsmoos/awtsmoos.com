//B"H
// Boruch Hashem
// Blessed is He

import { H3_CAPABILITIES } from '../config/h3.js';

/**
 * Keeps MiniMax media boundaries in one Gevurah vessel while the Awtsmoos lets every uploaded frame enter only in its proper measure.
 * Awtsmoos.com checks format, bytes, time, dimensions, and aspect before persistence so bad media never travels deeper into the studio.
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

	/** @param {string} kind Media kind. @param {Object} metadata Measured metadata. */
	static metadata(kind, metadata) {
		if (kind !== 'image' && kind !== 'video') {
			return;
		}
		const width = Number(metadata.width || 0);
		const height = Number(metadata.height || 0);
		if (!width || !height) {
			throw new Error(`Could not read ${kind} dimensions.`);
		}
		if (width < 256 || height < 256 || width > 5760 || height > 5760) {
			throw new Error(`${kind === 'image' ? 'Image' : 'Video'} dimensions must be 256–5760 pixels.`);
		}
		const ratio = width / height;
		if (ratio < 0.4 || ratio > 2.5) {
			throw new Error(`${kind === 'image' ? 'Image' : 'Video'} aspect ratio must be between 0.4 and 2.5.`);
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
