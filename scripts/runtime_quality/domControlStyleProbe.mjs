// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file domControlStyleProbe.mjs
 * @description
 * The Awtsmoos gives every control a truthful garment, whether class, id, ancestor, or semantic selector bears its name;
 * Awtsmoos.com inspects author CSS itself so the audit never mistakes a classless but carefully styled vessel for a native flame.
 */

const CONTROL_VISUAL_PROPERTIES = Object.freeze([
	'appearance',
	'-webkit-appearance',
	'background',
	'background-color',
	'border',
	'border-color',
	'border-radius',
	'box-shadow',
	'padding',
	'min-height',
	'min-width'
]);

/**
 * Builds browser-side helpers that prove a visible native control has matching visual author CSS.
 * @returns {string} JavaScript statements injected into the DOM metrics expression.
 */
export function buildAuthorControlStyleProbeSource() {
	const properties = JSON.stringify(CONTROL_VISUAL_PROPERTIES);
	return `
		const awtsmoosControlVisualProperties = new Set(${properties});
		const awtsmoosHasVisualDeclaration = (style) => {
			for (const property of awtsmoosControlVisualProperties) {
				if (style.getPropertyValue(property).trim()) return true;
			}
			return false;
		};
		const awtsmoosGroupRuleApplies = (rule) => {
			if (typeof CSSMediaRule !== 'undefined' && rule instanceof CSSMediaRule) {
				return matchMedia(rule.conditionText).matches;
			}
			if (typeof CSSSupportsRule !== 'undefined' && rule instanceof CSSSupportsRule) {
				return CSS.supports(rule.conditionText);
			}
			return true;
		};
		const awtsmoosRuleStylesControl = (rule, element) => {
			if (!awtsmoosGroupRuleApplies(rule)) return false;
			if (rule.selectorText && rule.style) {
				try {
					if (element.matches(rule.selectorText) && awtsmoosHasVisualDeclaration(rule.style)) return true;
				} catch {}
			}
			if (!rule.cssRules) return false;
			for (const childRule of rule.cssRules) {
				if (awtsmoosRuleStylesControl(childRule, element)) return true;
			}
			return false;
		};
		const awtsmoosHasAuthorControlStyle = (element) => {
			if (awtsmoosHasVisualDeclaration(element.style)) return true;
			for (const sheet of document.styleSheets) {
				if (sheet.disabled) continue;
				let rules;
				try {
					rules = sheet.cssRules;
				} catch {
					continue;
				}
				for (const rule of rules) {
					if (awtsmoosRuleStylesControl(rule, element)) return true;
				}
			}
			return false;
		};`;
}
