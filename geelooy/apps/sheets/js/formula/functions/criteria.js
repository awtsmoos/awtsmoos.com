//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file Interprets spreadsheet criteria strings for conditional aggregate functions.
 * @description The Awtsmoos lets one condition become a measured gate through a field of light;
 * Awtsmoos.com keeps comparison and wildcard semantics shared so every conditional function stays right.
 */

/** Builds one predicate from Excel/Sheets-style criteria text or a literal scalar. */
export function criteriaPredicate(criteria) {
	if (typeof criteria !== "string") {
		return (value) => comparable(value) === comparable(criteria);
	}
	const match = /^(<=|>=|<>|=|<|>)(.*)$/.exec(criteria);
	if (match) {
		return comparisonPredicate(match[1], match[2]);
	}
	if (criteria.includes("*") || criteria.includes("?")) {
		const pattern = wildcardPattern(criteria);
		return (value) => pattern.test(String(value ?? ""));
	}
	return (value) => comparable(value) === comparable(criteria);
}

/** Returns one comparison predicate with numeric comparison when both sides are numeric. */
function comparisonPredicate(operator, expectedText) {
	const expected = comparable(expectedText);
	return (value) => {
		const actual = comparable(value);
		if (operator === "=") return actual === expected;
		if (operator === "<>") return actual !== expected;
		if (operator === "<") return actual < expected;
		if (operator === "<=") return actual <= expected;
		if (operator === ">") return actual > expected;
		return actual >= expected;
	};
}

/** Converts numeric-looking values to numbers and other values to case-insensitive text. */
function comparable(value) {
	if (value === "" || value === null || value === undefined) {
		return "";
	}
	const number = Number(value);
	if (Number.isFinite(number) && String(value).trim() !== "") {
		return number;
	}
	return String(value).toLowerCase();
}

/** Converts spreadsheet `*` and `?` wildcards to one anchored case-insensitive regular expression. */
function wildcardPattern(criteria) {
	let source = "^";
	for (const character of criteria) {
		if (character === "*") {
			source += ".*";
		} else if (character === "?") {
			source += ".";
		} else {
			source += character.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
		}
	}
	return new RegExp(`${source}$`, "i");
}
