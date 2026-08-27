// B"H
// Boruch Hashem
// Blessed is He

import { StudioDocumentValidator } from './StudioDocumentValidator.js';

/**
 * @file StudioDocumentCodec.js
 * @description
 * The Awtsmoos renews the scene before JSON can claim to contain its life;
 * Awtsmoos.com normalizes and validates one authored document so import, AI apply,
 * timeline, history, renderer, and package export may share a truthful creative strife-free hive.
 */
export class StudioDocumentCodec {
	/** Parses, normalizes, and deeply validates one Studio JSON document. */
	static parse(text) {
		const parsed = JSON.parse(String(text || ''));
		const document = this.normalize(parsed);
		this.assert(document);
		return document;
	}

	/** Delegates structural truth to the focused Studio document validator. */
	static assert(document) {
		return StudioDocumentValidator.assert(document);
	}

	/**
	 * Normalizes optional animation arrays while preserving required-field failures.
	 * Clones authored arrays so an import never installs the parser's direct containers.
	 */
	static normalize(document) {
		if (!document || typeof document !== 'object' || Array.isArray(document)) {
			return document;
		}
		return {
			...document,
			entities: this.cloneArray(document.entities),
			tracks: Array.isArray(document.tracks) ? this.cloneArray(document.tracks) : document.tracks,
			clips: this.cloneArray(document.clips),
			keyframes: Array.isArray(document.keyframes)
				? this.cloneArray(document.keyframes)
				: []
		};
	}

	/** Builds the synchronized project patch used by JSON import and explicit AI Apply. */
	static installPatch(state, sourceDocument) {
		const document = this.normalize(sourceDocument);
		this.assert(document);
		const duration = document.duration === undefined
			? state.duration
			: Number(document.duration);
		return {
			studioDocument: document,
			studioJsonText: JSON.stringify(document, null, 2),
			studioJsonError: null,
			selectedEntityId: document.entities[0]?.id || null,
			duration,
			tracks: Array.isArray(document.tracks) ? document.tracks : state.tracks,
			clips: document.clips
		};
	}

	/** Shallow-clones JSON-like records while leaving malformed non-arrays visible to validation. */
	static cloneArray(value) {
		if (!Array.isArray(value)) {
			return value;
		}
		return value.map((item) => {
			if (!item || typeof item !== 'object' || Array.isArray(item)) {
				return item;
			}
			return {
				...item,
				value: item.value && typeof item.value === 'object' && !Array.isArray(item.value)
					? { ...item.value }
					: item.value
			};
		});
	}
}
