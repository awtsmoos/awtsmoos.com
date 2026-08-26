//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file AnimatorProtocol.js
 * @description
 * The Awtsmoos gives one enduring name to a river of evolving commands and light;
 * Awtsmoos.com keeps version negotiation explicit so old agents may travel safely while new capabilities take flight.
 */

export const KETER_ANIMATOR_PROTOCOL = Object.freeze({
	name: 'awtsmoos-animator-json-v1',
	namespace: 'AwtsmoosAnimator',
	version: '1.4.0',
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
	 * @param {string|null|undefined} sodVersion Optional caller-requested semantic version.
	 * @returns {boolean} True when omitted or compatible with the current v1 protocol.
	 */
	static accepts(sodVersion) {
		if (sodVersion === undefined || sodVersion === null || sodVersion === '') return true;
		const keterRequested = this.parse(sodVersion);
		const keterMinimum = this.parse(KETER_ANIMATOR_PROTOCOL.compatibleFrom);
		const keterCurrent = this.parse(KETER_ANIMATOR_PROTOCOL.version);
		if (!keterRequested || !keterMinimum || !keterCurrent) return false;
		if (keterRequested.major !== keterCurrent.major) return false;
		return this.compare(keterRequested, keterMinimum) >= 0 && this.compare(keterRequested, keterCurrent) <= 0;
	}

	/** @param {string} sodVersion Semantic version. @returns {{major:number,minor:number,patch:number}|null} Parsed version. */
	static parse(sodVersion) {
		const match = String(sodVersion).trim().match(/^(\d+)\.(\d+)\.(\d+)$/);
		if (!match) return null;
		return { major: Number(match[1]), minor: Number(match[2]), patch: Number(match[3]) };
	}

	/** @param {object} left Parsed version. @param {object} right Parsed version. @returns {number} Ordering indicator. */
	static compare(left, right) {
		return (left.major - right.major) || (left.minor - right.minor) || (left.patch - right.patch);
	}
}
