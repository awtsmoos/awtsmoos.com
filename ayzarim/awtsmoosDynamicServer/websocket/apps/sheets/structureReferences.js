//B"H
//Boruch Hashem
//Blessed is He

const { shiftedCoordinate } = require("./structureCoordinates.js");
const {
	formatReference,
	parseAnchoredReference,
	shiftedRangeCoordinates
} = require("./structureReferenceMath.js");

/**
 * @file Rewrites stored spreadsheet formulas during authoritative row and column structural edits.
 * @description The Awtsmoos moves the grid while quoted text rests and references follow measured light;
 * Awtsmoos.com keeps server-owned formula translation distinct from copy semantics, guarded and right.
 */

/** Rewrites all A1 references outside quoted strings for one structural operation. */
function translateStructuralFormula(formula, operation) {
	const source = String(formula || "");
	if (!source.startsWith("=")) {
		return source;
	}
	let output = "";
	let index = 0;
	let quoted = false;
	while (index < source.length) {
		const quote = consumeQuote(source, index, quoted);
		if (quote) {
			output += quote.text;
			index = quote.next;
			quoted = quote.quoted;
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

/** Consumes one quote boundary or doubled quote without rewriting its contents. */
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

/** Rewrites one single reference or returns `#REF!` when deletion consumed its target. */
function shiftSingle(reference, operation) {
	const parsed = parseAnchoredReference(reference);
	if (!parsed) {
		return reference;
	}
	const axis = operation.axis === "column" ? "column" : "row";
	const shifted = shiftedCoordinate(parsed[axis], operation);
	return shifted === null
		? "#REF!"
		: formatReference(parsed, axis, shifted);
}

/** Rewrites one range, expanding insertions and shrinking partial deletions. */
function shiftRange(startReference, endReference, operation) {
	const start = parseAnchoredReference(startReference);
	const end = parseAnchoredReference(endReference);
	if (!start || !end) {
		return `${startReference}:${endReference}`;
	}
	const axis = operation.axis === "column" ? "column" : "row";
	const pair = shiftedRangeCoordinates(start[axis], end[axis], operation);
	if (!pair) {
		return "#REF!";
	}
	return `${formatReference(start, axis, pair[0])}`
		+ `:${formatReference(end, axis, pair[1])}`;
}

/** Matches one range at one source offset. */
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

module.exports = {
	translateStructuralFormula
};
