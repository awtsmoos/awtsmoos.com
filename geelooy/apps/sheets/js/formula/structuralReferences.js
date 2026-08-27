//B"H
//Boruch Hashem
//Blessed is He

import { parseAnchoredReference } from "./referenceAddress.js";
import {
	formatShiftedReference,
	shiftedCoordinate,
	shiftedRangeCoordinates
} from "./structuralReferenceMath.js";

/**
 * @file Rewrites A1 references when worksheet rows or columns are inserted or deleted.
 * @description The Awtsmoos moves the measured grid while formulas remember which vessel they behold;
 * Awtsmoos.com keeps structural translation distinct from copy translation so every reference stays told.
 */

/** Rewrites references outside quoted strings for one structural row/column mutation. */
export function translateStructuralFormula(formula, operation = {}) {
	const source = String(formula || "");
	if (!source.startsWith("=")) {
		return source;
	}
	let output = "";
	let index = 0;
	let quoted = false;
	while (index < source.length) {
		const quoteResult = consumeQuote(source, index, quoted);
		if (quoteResult) {
			output += quoteResult.text;
			index = quoteResult.next;
			quoted = quoteResult.quoted;
			continue;
		}
		const range = quoted ? null : rangeAt(source, index);
		if (range) {
			output += shiftRange(range[1], range[2], operation);
			index += range[0].length;
			continue;
		}
		const reference = quoted ? null : referenceAt(source, index);
		if (reference) {
			output += shiftSingle(reference[0], operation);
			index += reference[0].length;
			continue;
		}
		output += source[index];
		index += 1;
	}
	return output;
}

/** Consumes one quote boundary or doubled quote while preserving string literal text. */
function consumeQuote(source, index, quoted) {
	if (source[index] !== '"') {
		return null;
	}
	if (quoted && source[index + 1] === '"') {
		return {
			next: index + 2,
			quoted,
			text: '""'
		};
	}
	return {
		next: index + 1,
		quoted: !quoted,
		text: '"'
	};
}

/** Shifts one individual reference or returns `#REF!` when its target was deleted. */
function shiftSingle(reference, operation) {
	const parsed = parseAnchoredReference(reference);
	if (!parsed) {
		return reference;
	}
	const axis = operation.axis === "column"
		? "column"
		: "row";
	const shifted = shiftedCoordinate(parsed[axis], operation);
	return shifted === null
		? "#REF!"
		: formatShiftedReference(parsed, axis, shifted);
}

/** Shrinks or expands one range under structural insert/delete semantics. */
function shiftRange(startReference, endReference, operation) {
	const start = parseAnchoredReference(startReference);
	const end = parseAnchoredReference(endReference);
	if (!start || !end) {
		return `${startReference}:${endReference}`;
	}
	const axis = operation.axis === "column"
		? "column"
		: "row";
	const pair = shiftedRangeCoordinates(
		start[axis],
		end[axis],
		operation
	);
	if (!pair) {
		return "#REF!";
	}
	return `${formatShiftedReference(start, axis, pair[0])}`
		+ `:${formatShiftedReference(end, axis, pair[1])}`;
}

/** Matches one A1 range at the requested source position. */
function rangeAt(source, index) {
	return /^(\$?[A-Za-z]{1,3}\$?[1-9][0-9]{0,4}):(\$?[A-Za-z]{1,3}\$?[1-9][0-9]{0,4})/.exec(
		source.slice(index)
	);
}

/** Matches one standalone A1 reference without consuming identifier text. */
function referenceAt(source, index) {
	const before = source[index - 1] || "";
	if (/[A-Za-z0-9_.]/.test(before)) {
		return null;
	}
	return /^\$?[A-Za-z]{1,3}\$?[1-9][0-9]{0,4}(?![A-Za-z0-9_.])/.exec(
		source.slice(index)
	);
}
