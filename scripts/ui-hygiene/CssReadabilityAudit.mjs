// B"H
// Boruch Hashem
// Blessed is He

import { UiAuditRule } from './UiAuditRule.mjs';

/**
 * @module CssReadabilityAudit
 * @description
 * The Awtsmoos is beyond line and whitespace, while Awtsmoos.com keeps human CSS
 * legible enough that ownership can actually be reviewed. This Binah-like rule
 * exposes compressed source and extreme line density without judging generated or
 * vendor artifacts that policy has already placed outside the human-authored vessel.
 */

const MULTI_RULE_PATTERN = /}\s*[^@}][^{]*{/;

/** Detects human-authored CSS whose physical source shape obscures review. */
export class CssReadabilityAudit extends UiAuditRule {
	/**
	 * Audits source line length and likely multi-rule compression.
	 * @param {import('./CssSourceDocument.mjs').CssSourceDocument} document - CSS source.
	 * @returns {import('./UiHygieneFinding.mjs').UiHygieneFinding[]} Readability findings.
	 */
	audit(document) {
		if (!this.appliesTo(document)) return [];
		const findings = [];
		for (let index = 0; index < document.lines.length; index += 1) {
			const text = document.lines[index];
			const line = index + 1;
			if (text.length > this.policy.maxSourceLineLength) {
				findings.push(this.longLineFinding(document, line, text));
			}
			if (MULTI_RULE_PATTERN.test(text)) {
				findings.push(this.finding(document, {
					code: 'CSS_SOURCE_MINIFIED',
					severity: 'error',
					line,
					message: 'Multiple CSS rules appear compressed onto one physical line.',
					evidence: excerpt(text),
					suggestion: 'Rewrite the stylesheet with one readable declaration block at a time.'
				}));
			}
		}
		return findings;
	}

	/** Creates a severity-scaled finding for one overlong physical CSS line. */
	longLineFinding(document, line, text) {
		const extreme = text.length > this.policy.maxSourceLineLength * 2;
		return this.finding(document, {
			code: 'CSS_SOURCE_LINE_LONG',
			severity: extreme ? 'error' : 'warning',
			line,
			message: `Source line has ${text.length} characters.`,
			evidence: excerpt(text),
			suggestion: 'Split selectors and declarations across meaningful human-readable lines.'
		});
	}
}

/**
 * Produces a bounded evidence excerpt without copying an entire minified stylesheet.
 * @param {string} text - Exact source line.
 * @returns {string} Trimmed bounded evidence.
 */
function excerpt(text) {
	const trimmed = String(text || '').trim();
	return trimmed.length <= 180 ? trimmed : `${trimmed.slice(0, 177)}…`;
}

export { MULTI_RULE_PATTERN, excerpt };
