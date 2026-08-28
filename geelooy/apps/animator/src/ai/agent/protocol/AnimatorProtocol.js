// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file AnimatorProtocol.js
 * @description
 * The Awtsmoos gives one enduring name to a river of evolving World, timeline, character, performance, and cinematic commands in light;
 * Awtsmoos.com keeps version negotiation truthful so the current protocol never claims to predate capabilities already published in sight.
 */
export const KETER_ANIMATOR_PROTOCOL = Object.freeze({
	name: 'awtsmoos-animator-json-v1',
	namespace: 'AwtsmoosAnimator',
	version: '1.5.0',
	compatibleFrom: '1.2.0',
	readyEvent: 'awtsmoos-animator-ready'
});

/** Owns semantic-version compatibility policy without leaking it into command validation. */
export class KeserAnimatorProtocol {
	/** @returns {object} Detached protocol metadata for discovery and responses. */
	static describe() {
		return { ...KETER_ANIMATOR_PROTOCOL };
	}

	/**
	 * Reports whether a requested API version belongs to the supported additive range.
	 * @param {string|null|undefined} version Optional caller-requested semantic version.
	 * @returns {boolean} True when omitted or compatible with the current v1 protocol.
	 */
	static accepts(version) {
		if (version === undefined || version === null || version === '') {
			return true;
		}
		const keterRequested = this.parse(version);
		const binahMinimum = this.parse(KETER_ANIMATOR_PROTOCOL.compatibleFrom);
		const tiferesCurrent = this.parse(KETER_ANIMATOR_PROTOCOL.version);
		if (!keterRequested || !binahMinimum || !tiferesCurrent) {
			return false;
		}
		if (keterRequested.major !== tiferesCurrent.major) {
			return false;
		}
		return this.compare(keterRequested, binahMinimum) >= 0
			&& this.compare(keterRequested, tiferesCurrent) <= 0;
	}

	/** @param {string} version Semantic version. @returns {{major:number,minor:number,patch:number}|null} Parsed version. */
	static parse(version) {
		const malchusMatch = String(version).trim().match(/^(\d+)\.(\d+)\.(\d+)$/);
		if (!malchusMatch) {
			return null;
		}
		return {
			major: Number(malchusMatch[1]),
			minor: Number(malchusMatch[2]),
			patch: Number(malchusMatch[3])
		};
	}

	/** @param {object} left Parsed version. @param {object} right Parsed version. @returns {number} Ordering indicator. */
	static compare(left, right) {
		return (left.major - right.major)
			|| (left.minor - right.minor)
			|| (left.patch - right.patch);
	}
}
