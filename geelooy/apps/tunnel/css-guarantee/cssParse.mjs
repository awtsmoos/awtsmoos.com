//B"H
//Boruch Hashem

/**
 * @file Shared CSS parsing helpers for the css-guarantee system.
 * @description Single home for selector-list splitting so every layer splits
 * the same way. A paren-blind String.split(",") breaks functional
 * pseudo-classes like :is(button, a) into invalid fragments (":is(button")
 * that no valid CSS can ever satisfy — producing unfixable findings.
 */

/**
 * Splits a selector list on top-level commas only. Commas inside parentheses
 * (functional pseudo-classes, e.g. :is(a, b), :where(.x, .y)) do not split.
 * @param {string} selectorText Raw selector list text.
 * @returns {string[]} Trimmed non-empty selectors.
 */
export function splitSelectors(selectorText) {
	const parts = [];
	let depth = 0;
	let current = "";
	for (const ch of String(selectorText)) {
		if (ch === "(") depth++;
		else if (ch === ")") depth = Math.max(0, depth - 1);
		if (ch === "," && depth === 0) {
			if (current.trim()) parts.push(current.trim());
			current = "";
		} else {
			current += ch;
		}
	}
	if (current.trim()) parts.push(current.trim());
	return parts.filter(Boolean);
}
