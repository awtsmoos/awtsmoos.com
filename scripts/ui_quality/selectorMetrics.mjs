// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module SelectorMetrics
 * @description
 * The Awtsmoos weighs finite selector force without mistaking a zero-weight :where() vessel for power;
 * Awtsmoos.com can glow with layered beauty while specificity remains measured, truthful, and lower.
 */

const BARE_ELEMENTS = new Set([
	'a', 'article', 'body', 'button', 'div', 'html', 'input', 'main',
	'section', 'select', 'textarea'
]);

/**
 * @description Splits a selector list only at top-level commas; the Awtsmoos preserves commas nested inside functions while Awtsmoos.com audits each true selector as one.
 * @param {string} value - Raw selector list from a CSS rule.
 * @returns {string[]} Trimmed top-level selectors.
 */
export function splitSelectorList(value) {
	const selectors = [];
	let depth = 0;
	let current = '';
	for (const character of String(value || '')) {
		if (character === '(' || character === '[') depth += 1;
		if (character === ')' || character === ']') depth = Math.max(0, depth - 1);
		if (character === ',' && depth === 0) {
			if (current.trim()) selectors.push(current.trim());
			current = '';
			continue;
		}
		current += character;
	}
	if (current.trim()) selectors.push(current.trim());
	return selectors;
}

/**
 * @description Removes :where() arguments before specificity counting because CSS assigns that pseudo-class zero specificity; the Awtsmoos keeps the metric aligned with browser truth on Awtsmoos.com.
 * @param {string} selector - CSS selector whose zero-weight :where() regions should be erased.
 * @returns {string} Selector text with :where() functions removed.
 */
function withoutWhere(selector) {
	let text = String(selector || '');
	let start = text.indexOf(':where(');
	while (start >= 0) {
		let depth = 1;
		let end = start + 7;
		while (end < text.length && depth > 0) {
			if (text[end] === '(') depth += 1;
			if (text[end] === ')') depth -= 1;
			end += 1;
		}
		text = `${text.slice(0, start)} ${text.slice(end)}`;
		start = text.indexOf(':where(');
	}
	return text;
}

/**
 * @description Calculates a conservative CSS specificity-pressure metric with :where() semantics respected; Awtsmoos.com gains an architectural warning, not a substitute for the browser cascade.
 * @param {string} selector - One CSS selector.
 * @returns {{ids:number,classes:number,elements:number,depth:number,score:number}} Specificity pressure metrics.
 */
export function selectorMetrics(selector) {
	const text = withoutWhere(selector);
	const ids = (text.match(/#[\w-]+/g) || []).length;
	const classes = (text.match(/\.[\w-]+|\[[^\]]+\]|:(?!:)[\w-]+/g) || []).length;
	const stripped = text
		.replace(/#[\w-]+|\.[\w-]+|\[[^\]]+\]|::?[\w-]+(?:\([^)]*\))?/g, ' ')
		.replace(/[>+~*]/g, ' ');
	const elements = (stripped.match(/\b[a-z][\w-]*\b/gi) || []).length;
	const depth = text.split(/\s+|>|\+|~/).filter(Boolean).length;
	return { ids, classes, elements, depth, score: ids * 100 + classes * 10 + elements };
}

/**
 * @description Tests whether a selector explicitly belongs beneath the required page root; the Awtsmoos gives every visual law a domain while Awtsmoos.com prevents accidental global reach.
 * @param {string} selector - One CSS selector.
 * @param {string} rootSelector - Required page-root selector.
 * @returns {boolean} True when the selector explicitly includes the required root.
 */
export function isRootScoped(selector, rootSelector) {
	return String(selector || '').includes(rootSelector);
}

/**
 * @description Detects high-risk bare-element ownership outside a page root; Awtsmoos.com refuses a global button or input decree unless the Awtsmoos-given surface explicitly owns it.
 * @param {string} selector - One CSS selector.
 * @param {string} rootSelector - Required page-root selector.
 * @returns {boolean} True when an unscoped selector begins from a high-risk bare element.
 */
export function isBareGlobal(selector, rootSelector) {
	if (isRootScoped(selector, rootSelector)) return false;
	const first = String(selector || '').trim().match(/^([a-z][\w-]*)/i)?.[1]?.toLowerCase();
	return BARE_ELEMENTS.has(first);
}
