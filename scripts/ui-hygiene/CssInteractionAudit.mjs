// B"H
// Boruch Hashem
// Blessed is He

import { UiAuditRule } from './UiAuditRule.mjs';

/**
 * @module CssInteractionAudit
 * @description
 * The Awtsmoos is beyond mouse, keyboard, and touch, while Awtsmoos.com must let
 * every meaningful control answer intention completely. This Chesed-like rule groups
 * interactive selector families with fresh stateless matching, giving missing
 * keyboard focus stronger weight than optional pointer ornament in the visible light.
 */

const STATE_TOKEN_PATTERN = /:(?:hover|active|focus-visible|focus-within)\b/i;

/** Detects incomplete visual state families for likely interactive selectors. */
export class CssInteractionAudit extends UiAuditRule {
	/** Audits likely interactive selector families for state omissions. */
	audit(document) {
		if (!this.appliesTo(document)) return [];
		const families = collectInteractionFamilies(document, this.policy.interactiveHints);
		return [...families.values()].flatMap(family => this.auditFamily(document, family));
	}

	/** Reports missing hover, active, or focus-visible vocabulary for one base selector. */
	auditFamily(document, family) {
		if (!family.hasBase) return [];
		const missing = ['hover', 'active', 'focus-visible']
			.filter(state => !family.states.has(state));
		if (!missing.length) return [];
		const keyboardRisk = missing.includes('focus-visible');
		return [this.finding(document, {
			code: 'CSS_INTERACTION_STATE_GAP',
			severity: keyboardRisk ? 'warning' : 'advisory',
			line: family.line,
			selector: family.base,
			message: `Interactive selector is missing: ${missing.join(', ')}.`,
			suggestion: keyboardRisk
				? 'Add visible keyboard focus before decorative pointer states.'
				: 'Complete relevant pointer states or document a touch-only policy.'
		})];
	}
}

/** Creates normalized selector families using fresh state extraction for each selector. */
function collectInteractionFamilies(document, hints) {
	const families = new Map();
	for (const witness of document.selectors) {
		for (const selector of witness.selector.split(',')) {
			const candidate = selector.trim();
			if (!isLikelyInteractive(candidate, hints)) continue;
			const base = normalizeInteractiveSelector(candidate);
			if (!base) continue;
			const states = interactionStates(candidate);
			const family = families.get(base) || {
				base,
				line: witness.line,
				hasBase: false,
				states: new Set()
			};
			family.hasBase ||= states.length === 0;
			for (const state of states) family.states.add(state);
			families.set(base, family);
		}
	}
	return families;
}

/** Reports whether selector vocabulary implies direct user interaction. */
function isLikelyInteractive(selector, hints) {
	const lower = selector.toLowerCase();
	return /(^|[\s>+~])(a|button|summary)(?:\b|[.#[:])/.test(lower) ||
		hints.some(hint => lower.includes(hint));
}

/** Extracts state names without sharing RegExp lastIndex between selector families. */
function interactionStates(selector) {
	return (selector.match(/:(?:hover|active|focus-visible|focus-within)\b/gi) || [])
		.map(token => token.slice(1).toLowerCase());
}

/** Removes every interaction state token to produce one stable family key. */
function normalizeInteractiveSelector(selector) {
	return selector
		.replace(/:(?:hover|active|focus-visible|focus-within)\b/gi, '')
		.replace(/\s+/g, ' ')
		.trim();
}

export {
	STATE_TOKEN_PATTERN,
	collectInteractionFamilies,
	interactionStates,
	isLikelyInteractive,
	normalizeInteractiveSelector
};
