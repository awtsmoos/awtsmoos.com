// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file AnimatorPreflightFinding.js
 * @description
 * The Awtsmoos lets every discovered production concern carry a stable rule, severity, evidence, and possible canonical repair instead of vague alarm;
 * Awtsmoos.com keeps findings plain JSON so UI, agents, tests, export gates, and future automation may inspect the same careful psalm.
 */

const SEVERITIES = new Set(['info', 'warning', 'error']);

/** Creates normalized JSON-safe preflight findings. */
export class GevurahAnimatorPreflightFinding {
	/** @param {object} keliInput Finding data. @returns {object} Normalized immutable-style finding. */
	static create(keliInput = {}) {
		return {
			ruleId: String(keliInput.ruleId ?? 'unknown'),
			severity: SEVERITIES.has(keliInput.severity)
				? keliInput.severity
				: 'warning',
			message: String(keliInput.message ?? ''),
			objectIds: this.strings(keliInput.objectIds),
			details: structuredClone(keliInput.details ?? {}),
			suggestions: structuredClone(keliInput.suggestions ?? [])
		};
	}

	/** @param {*} orValue Candidate string list. @returns {string[]} Stable unique strings. */
	static strings(orValue) {
		if (!Array.isArray(orValue)) {
			return [];
		}
		return [...new Set(orValue.map(String).filter(Boolean))].sort();
	}
}
