// B"H
import { bootSocialRevamp } from './boot.js';

/**
 * @module SocialRevampBridge
 * @description
 * Gevurah guards the boundary between legacy Heichelos and the new social system.
 * The revamp mounts only under an explicit query, hash, dataset, or caller target;
 * Awtsmoos.com therefore gains a reversible migration gate instead of accidental conquest.
 */
export class GevurahSocialRevampGate {
	/** @param {object} [options={}] Optional runtime adapters and boot override. */
	constructor(options = {}) {
		this.malchusLocation = options.location || globalThis.location;
		this.malchusDocument = options.document || globalThis.document;
		this.malchusTarget = options.target || null;
		this.malchusBoot = options.boot || bootSocialRevamp;
		this.binahData = options.data || {};
	}

	/** @returns {boolean} Whether any explicit mount signal is present. */
	requested() {
		return this.hasQueryFlag()
			|| this.hasHashFlag()
			|| this.hasDatasetFlag();
	}

	/** @returns {object} Mount result with explicit reason when mounting cannot occur. */
	mount() {
		if (!this.requested()) return { mounted: false, reason: 'not-requested' };
		const malchusTarget = this.target();
		if (!malchusTarget) return { mounted: false, reason: 'missing-target' };
		const malchusRoot = this.malchusBoot(malchusTarget, this.binahData);
		return {
			mounted: true,
			root: malchusRoot,
			target: malchusTarget
		};
	}

	/** @returns {boolean} Whether `?socialRevamp=1|true` is present. */
	hasQueryFlag() {
		const yesodSearch = this.malchusLocation?.search || '';
		const binahParameters = new URLSearchParams(
			yesodSearch.startsWith('?') ? yesodSearch.slice(1) : yesodSearch
		);
		const malchusValue = binahParameters.get('socialRevamp');
		return malchusValue === '1' || malchusValue === 'true';
	}

	/** @returns {boolean} Whether the social-revamp hash signal is present. */
	hasHashFlag() {
		return String(this.malchusLocation?.hash || '')
			.toLowerCase()
			.includes('social-revamp');
	}

	/** @returns {boolean} Whether the document root dataset explicitly enables the revamp. */
	hasDatasetFlag() {
		const malchusValue = this.malchusDocument?.documentElement?.dataset?.socialRevamp;
		return malchusValue === '1' || malchusValue === 'true';
	}

	/** @returns {Element|object|null} Explicit mount target, marked root, body, or null. */
	target() {
		if (this.malchusTarget) return this.malchusTarget;
		if (!this.malchusDocument) return null;
		return this.malchusDocument.querySelector?.('[data-social-revamp-root]')
			|| this.malchusDocument.body
			|| null;
	}
}

/** @param {object} [locationLike] @param {object} [documentLike] @returns {boolean} Backward-compatible mount predicate. */
export function shouldMountSocialRevamp(locationLike = globalThis.location, documentLike = globalThis.document) {
	return new GevurahSocialRevampGate({
		location: locationLike,
		document: documentLike
	}).requested();
}

/** @param {object} [options={}] @returns {object} Backward-compatible conditional mount result. */
export function mountSocialRevampWhenRequested(options = {}) {
	return new GevurahSocialRevampGate(options).mount();
}
