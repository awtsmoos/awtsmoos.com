// B"H
// Boruch Hashem
// Blessed is He

import { UiAuditRule } from './UiAuditRule.mjs';

/**
 * @module CssViewportAudit
 * @description
 * The Awtsmoos is beyond edge and measure, while Awtsmoos.com must still keep every
 * mobile vessel inside the visible world. This Netzach-like rule marks viewport-width
 * force, rigid inline dimensions, and fixed surfaces without file-level containment
 * evidence so off-screen UI becomes measurable before a thumb ever meets it.
 */

const VIEWPORT_WIDTH_PATTERN = /\b(?:width|inline-size)\s*:\s*(?:100d?vw|100vw)\b/i;
const RIGID_INLINE_PATTERN = /\b(?:width|inline-size)\s*:\s*(\d+(?:\.\d+)?)px\b/i;
const FIXED_PATTERN = /\bposition\s*:\s*fixed\b/i;
const CONTAINMENT_PATTERN = /\b(?:max-inline-size|max-width|inset-inline|overflow-x)\s*:/i;

/** Detects CSS declarations likely to escape narrow visual viewports. */
export class CssViewportAudit extends UiAuditRule {
	/**
	 * Audits viewport-width force, rigid dimensions, and fixed-surface containment.
	 * @param {import('./CssSourceDocument.mjs').CssSourceDocument} document - CSS source.
	 * @returns {import('./UiHygieneFinding.mjs').UiHygieneFinding[]} Viewport findings.
	 */
	audit(document) {
		if (!this.appliesTo(document)) return [];
		const findings = [];
		for (const witness of document.matchingLines(VIEWPORT_WIDTH_PATTERN)) {
			findings.push(this.finding(document, {
				code: 'CSS_VIEWPORT_WIDTH_FORCE',
				severity: 'warning',
				line: witness.line,
				message: 'Viewport-width sizing can overflow when scrollbars or insets exist.',
				evidence: witness.text.trim(),
				suggestion: 'Prefer 100%, logical insets, or a bounded container size.'
			}));
		}
		for (const witness of document.matchingLines(RIGID_INLINE_PATTERN)) {
			findings.push(...this.auditRigidInline(document, witness));
		}
		findings.push(...this.auditFixedSurfaces(document));
		return findings;
	}

	/** Classifies one rigid pixel width against the mobile-first inline budget. */
	auditRigidInline(document, witness) {
		const width = Number(witness.text.match(RIGID_INLINE_PATTERN)?.[1] || 0);
		if (width <= this.policy.maxRigidInlinePixels) return [];
		return [this.finding(document, {
			code: 'CSS_RIGID_INLINE_SIZE',
			severity: 'warning',
			line: witness.line,
			message: `Rigid ${width}px inline size exceeds the narrow-phone budget.`,
			evidence: witness.text.trim(),
			suggestion: 'Use min(), max(), clamp(), or max-inline-size with a fluid base.'
		})];
	}

	/** Reports fixed-position files that contain no visible containment vocabulary. */
	auditFixedSurfaces(document) {
		const fixed = document.matchingLines(FIXED_PATTERN);
		if (!fixed.length || CONTAINMENT_PATTERN.test(document.text)) return [];
		return [this.finding(document, {
			code: 'CSS_FIXED_WITHOUT_CONTAINMENT',
			severity: 'advisory',
			line: fixed[0].line,
			message: 'Fixed surface has no file-level inline containment evidence.',
			evidence: fixed[0].text.trim(),
			suggestion: 'Bound fixed UI with logical insets and a viewport-safe maximum size.'
		})];
	}
}

export {
	CONTAINMENT_PATTERN,
	FIXED_PATTERN,
	RIGID_INLINE_PATTERN,
	VIEWPORT_WIDTH_PATTERN
};
