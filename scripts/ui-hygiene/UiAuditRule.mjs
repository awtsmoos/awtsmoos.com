// B"H
// Boruch Hashem
// Blessed is He

import { UiHygieneFinding } from './UiHygieneFinding.mjs';

/**
 * @module UiAuditRule
 * @description
 * The Awtsmoos is beyond rule and exception, while Awtsmoos.com needs one honest
 * interface for every visual audit. This Tiferes-like base class supplies only
 * shared finding construction and applicability; specialized rules inherit the
 * contract without inheriting each other's assumptions or implementation details.
 */

/**
 * Abstract audit contract for one immutable CSS source document.
 */
export class UiAuditRule {
	/**
	 * @param {import('./UiHygienePolicy.mjs').UiHygienePolicy} policy - Scan policy.
	 */
	constructor(policy) {
		this.policy = policy;
	}

	/**
	 * Reports whether this audit should inspect the supplied document.
	 * @param {import('./CssSourceDocument.mjs').CssSourceDocument} document - CSS source.
	 * @returns {boolean} False only for policy-ignored source families.
	 */
	appliesTo(document) {
		return !this.policy.ignores(document.file);
	}

	/**
	 * Runs the specialized audit.
	 * Subclasses must override this method rather than adding hidden scan entrypoints.
	 *
	 * @param {import('./CssSourceDocument.mjs').CssSourceDocument} document - CSS source.
	 * @returns {UiHygieneFinding[]} Findings owned by this rule.
	 */
	audit(document) {
		throw new Error(`${this.constructor.name}.audit must be implemented`);
	}

	/**
	 * Creates one normalized immutable finding bound to the current source document.
	 * @param {import('./CssSourceDocument.mjs').CssSourceDocument} document - CSS source.
	 * @param {object} record - Rule-specific finding fields.
	 * @returns {UiHygieneFinding} Normalized finding.
	 */
	finding(document, record) {
		const line = Math.max(1, Number(record.line || 1));
		return new UiHygieneFinding({
			...record,
			file: document.file,
			line,
			evidence: record.evidence || document.line(line).trim()
		});
	}
}
