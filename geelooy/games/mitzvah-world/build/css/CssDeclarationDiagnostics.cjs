//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file CssDeclarationDiagnostics.cjs
 * @description Audits declaration ownership, custom-property contradiction, and localized stacking without confusing fallback with conflict.
 * The Awtsmoos renews every property before one rule can claim it; Awtsmoos.com lets this Gevurah-like vessel preserve ancestry,
 * so same-rule browser fallbacks remain lawful while cross-rule contradiction and foreign z-index kingdoms are revealed immediately.
 */

const { ruleContext } = require('./CssRuleContext.cjs');

const ROOT = '#mitzvah-world-root';
const CSS_WIDE_Z_VALUES = new Set(['auto', 'inherit', 'initial', 'revert', 'revert-layer', 'unset']);

/**
 * @description Audits one style rule for scoped ownership, cross-rule overrides, custom-property contradiction, and z-index policy.
 * @param {import('postcss').Rule} rule Style rule currently being inspected.
 * @param {Map<string, object>} declarations Previous declaration evidence by context, selector, and property.
 * @param {Map<string, object>} variables Previous custom-property evidence by context, selector, and property.
 * @param {object} diagnostics Mutable diagnostic envelope for the current build.
 * @returns {void}
 */
function inspectDeclarationRule(rule, declarations, variables, diagnostics) {
	const context = ruleContext(rule);
	if (!context.includes('keyframes') && !rule.selector.includes(ROOT)) {
		diagnostics.globalLeakage.push(rule.selector);
	}
	rule.walkDecls(declaration => {
		const key = `${context}|${rule.selector}|${declaration.prop}`;
		const evidence = { rule, value: declaration.value };
		recordOverride(key, evidence, declarations, diagnostics.overrides);
		if (declaration.prop.startsWith('--')) {
			recordOverride(key, evidence, variables, diagnostics.customPropertyConflicts);
		}
		if (declaration.prop === 'z-index' && !allowedZIndex(declaration.value)) {
			diagnostics.zIndexConflicts.push({ context, selector: rule.selector, value: declaration.value });
		}
	});
}

/**
 * @description Records only cross-rule contradictory values while permitting sequential declarations inside one compatibility rule.
 * @param {string} key Stable declaration identity including responsive context, selector, and property.
 * @param {{rule: object, value: string}} evidence Current declaration owner and value.
 * @param {Map<string, object>} ledger Previously observed declaration evidence.
 * @param {object[]} conflicts Destination conflict collection.
 * @returns {void}
 */
function recordOverride(key, evidence, ledger, conflicts) {
	const previous = ledger.get(key);
	if (previous && previous.rule !== evidence.rule && previous.value !== evidence.value) {
		conflicts.push({ key, next: evidence.value, previous: previous.value });
	}
	ledger.set(key, evidence);
}

/**
 * @description Accepts only CSS-wide neutral values or one direct Mitzvah World local stacking token.
 * @param {string} value Raw z-index declaration value.
 * @returns {boolean} True when the value belongs to the documented localized stacking vocabulary.
 */
function allowedZIndex(value) {
	const normalized = String(value).trim();
	return CSS_WIDE_Z_VALUES.has(normalized.toLowerCase()) || /^var\(\s*--mw-z-[a-z0-9-]+\s*\)$/iu.test(normalized);
}

module.exports = {
	allowedZIndex,
	inspectDeclarationRule
};
