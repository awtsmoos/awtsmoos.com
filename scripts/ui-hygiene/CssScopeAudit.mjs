// B"H
// Boruch Hashem
// Blessed is He

import { UiAuditRule } from './UiAuditRule.mjs';

/**
 * @module CssScopeAudit
 * @description
 * The Awtsmoos is beyond root and branch, while Awtsmoos.com needs local visual
 * ownership so one app cannot restyle another by accident. This Gevurah-like rule
 * finds document-root and bare-element selectors that escape component boundaries,
 * while respecting only the shell families explicitly declared by policy.
 */

const BARE_ELEMENT_PATTERN = /^(?:\*|a|button|dialog|details|input|select|summary|textarea)(?:\b|\s|,|:|\[)/i;

/** Detects likely selector ownership escaping local component or application scope. */
export class CssScopeAudit extends UiAuditRule {
	/**
	 * Audits conservative selector witnesses for global ownership leakage.
	 * @param {import('./CssSourceDocument.mjs').CssSourceDocument} document - CSS source.
	 * @returns {import('./UiHygieneFinding.mjs').UiHygieneFinding[]} Scope findings.
	 */
	audit(document) {
		if (!this.appliesTo(document)) return [];
		return document.selectors.flatMap(witness => this.auditSelector(document, witness));
	}

	/**
	 * Classifies one selector witness without claiming complete CSS grammar support.
	 * @param {import('./CssSourceDocument.mjs').CssSourceDocument} document - CSS source.
	 * @param {{selector:string,line:number}} witness - Selector text and coordinate.
	 * @returns {import('./UiHygieneFinding.mjs').UiHygieneFinding[]} Findings for selector.
	 */
	auditSelector(document, witness) {
		const selector = witness.selector.trim();
		if (usesDocumentRoot(selector, this.policy.documentRoots)) {
			if (this.policy.allowsDocumentScope(document.file)) return [];
			return [this.finding(document, {
				code: 'CSS_DOCUMENT_SCOPE_LEAK',
				severity: 'error',
				line: witness.line,
				selector,
				message: 'Document-root selector escapes local style ownership.',
				suggestion: 'Bind the rule to an app or component root class.'
			})];
		}
		if (!BARE_ELEMENT_PATTERN.test(selector)) return [];
		return [this.finding(document, {
			code: 'CSS_BARE_ELEMENT_SCOPE',
			severity: 'warning',
			line: witness.line,
			selector,
			message: 'Bare interactive/document selector can affect unrelated surfaces.',
			suggestion: 'Prefix the selector with the owning app or component scope.'
		})];
	}
}

/**
 * Reports whether a selector begins with or directly groups a document root.
 * @param {string} selector - Conservative selector witness.
 * @param {readonly string[]} roots - Explicit document-root tokens.
 * @returns {boolean} True when document ownership is visible.
 */
function usesDocumentRoot(selector, roots) {
	return selector.split(',').some(part => {
		const candidate = part.trim();
		return roots.some(root => (
			candidate === root ||
			candidate.startsWith(`${root}.`) ||
			candidate.startsWith(`${root}[`) ||
			candidate.startsWith(`${root} `) ||
			candidate.startsWith(`${root}:`)
		));
	});
}

export { BARE_ELEMENT_PATTERN, usesDocumentRoot };
