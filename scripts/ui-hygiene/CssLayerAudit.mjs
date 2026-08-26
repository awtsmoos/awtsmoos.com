// B"H
// Boruch Hashem
// Blessed is He

import { UiAuditRule } from './UiAuditRule.mjs';

/**
 * @module CssLayerAudit
 * @description
 * The Awtsmoos is beyond front and back, while Awtsmoos.com still needs sane local
 * stacking contracts. This Hod-like rule exposes runaway numeric z-index values and
 * `!important` escalation so visual precedence becomes intentional architecture,
 * not an arms race between unrelated components trying to stand above each other.
 */

const Z_INDEX_PATTERN = /\bz-index\s*:\s*(-?\d+)/i;
const IMPORTANT_PATTERN = /!important\b/i;

/** Detects layer escalation and specificity-force debt. */
export class CssLayerAudit extends UiAuditRule {
	/**
	 * Audits numeric stacking layers and file-level important density.
	 * @param {import('./CssSourceDocument.mjs').CssSourceDocument} document - CSS source.
	 * @returns {import('./UiHygieneFinding.mjs').UiHygieneFinding[]} Layer findings.
	 */
	audit(document) {
		if (!this.appliesTo(document)) return [];
		const findings = document.matchingLines(Z_INDEX_PATTERN)
			.flatMap(witness => this.auditZIndex(document, witness));
		const important = document.matchingLines(IMPORTANT_PATTERN);
		if (important.length > this.policy.maxImportantPerFile) {
			findings.push(this.finding(document, {
				code: 'CSS_IMPORTANT_ESCALATION',
				severity: 'error',
				line: important[0].line,
				message: `${important.length} !important declarations exceed the file budget.`,
				evidence: important[0].text.trim(),
				suggestion: 'Resolve selector ownership instead of increasing specificity force.'
			}));
		}
		return findings;
	}

	/**
	 * Classifies one numeric z-index declaration against ordinary and critical limits.
	 * @param {import('./CssSourceDocument.mjs').CssSourceDocument} document - CSS source.
	 * @param {{line:number,text:string}} witness - Matching source line.
	 * @returns {import('./UiHygieneFinding.mjs').UiHygieneFinding[]} Zero or one finding.
	 */
	auditZIndex(document, witness) {
		const match = witness.text.match(Z_INDEX_PATTERN);
		const value = Number(match?.[1] || 0);
		const magnitude = Math.abs(value);
		if (magnitude <= this.policy.maxOrdinaryZIndex) return [];
		const critical = magnitude >= this.policy.criticalZIndex;
		return [this.finding(document, {
			code: critical ? 'CSS_Z_INDEX_CRITICAL' : 'CSS_Z_INDEX_HIGH',
			severity: critical ? 'critical' : 'warning',
			line: witness.line,
			message: `Raw z-index ${value} exceeds the local ordinary layer budget.`,
			evidence: witness.text.trim(),
			suggestion: 'Replace raw escalation with a component-local named layer contract.'
		})];
	}
}

export { IMPORTANT_PATTERN, Z_INDEX_PATTERN };
