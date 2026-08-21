//B"H
//Boruch Hashem
//Blessed is He

import { flattenValues, toNumber } from "../coercion.js";
import { formulaError, isFormulaError } from "../errors.js";
import { functionDescriptor } from "./helpers.js";
import { criteriaPredicate } from "./criteria.js";

/**
 * @file Registers Excel/Sheets conditional counting, summing, and averaging across aligned ranges.
 * @description The Awtsmoos lets criteria open measured gates through rows of many-colored light;
 * Awtsmoos.com keeps conditional aggregation aligned, bounded, and explicit so every answer stays right.
 */
export const conditionalAggregateFunctions = Object.freeze([
	functionDescriptor("COUNTIF", "Statistics", "COUNTIF(range,criterion)", "Counts values matching one criterion.", "=COUNTIF(A1:A10,\">5\")", (args) => countIf(args)),
	functionDescriptor("COUNTIFS", "Statistics", "COUNTIFS(range1,criterion1,…)", "Counts positions matching every criterion.", "=COUNTIFS(A1:A10,\">5\",B1:B10,\"Yes\")", (args) => countIfs(args)),
	functionDescriptor("SUMIF", "Math", "SUMIF(range,criterion,sumRange)", "Sums aligned values whose criterion matches.", "=SUMIF(A1:A10,\">5\",B1:B10)", (args) => sumIf(args)),
	functionDescriptor("SUMIFS", "Math", "SUMIFS(sumRange,range1,criterion1,…)", "Sums values matching every aligned criterion.", "=SUMIFS(C1:C10,A1:A10,\">5\")", (args) => sumIfs(args)),
	functionDescriptor("AVERAGEIF", "Statistics", "AVERAGEIF(range,criterion,averageRange)", "Averages aligned values matching one criterion.", "=AVERAGEIF(A1:A10,\">0\",B1:B10)", (args) => averageIf(args)),
	functionDescriptor("AVERAGEIFS", "Statistics", "AVERAGEIFS(avgRange,range1,criterion1,…)", "Averages values matching every aligned criterion.", "=AVERAGEIFS(C1:C10,A1:A10,\">0\")", (args) => averageIfs(args))
]);

/** Counts one-dimensional flattened values satisfying one criterion. */
function countIf(args) {
	const values = flattenValues([args[0]]);
	const predicate = criteriaPredicate(args[1]);
	return values.filter(predicate).length;
}

/** Counts aligned positions satisfying every range/criterion pair. */
function countIfs(args) {
	const pairs = criteriaPairs(args);
	if (!pairs.length) return 0;
	const size = Math.min(...pairs.map((pair) => pair.values.length));
	let count = 0;
	for (let index = 0; index < size; index += 1) {
		if (pairs.every((pair) => pair.predicate(pair.values[index]))) count += 1;
	}
	return count;
}

/** Sums one aligned range using a single criterion range. */
function sumIf(args) {
	const criteria = flattenValues([args[0]]);
	const values = flattenValues([args[2] ?? args[0]]);
	const predicate = criteriaPredicate(args[1]);
	return alignedNumbers(values, (index) => predicate(criteria[index]));
}

/** Sums one range using multiple aligned criteria. */
function sumIfs(args) {
	const values = flattenValues([args[0]]);
	const pairs = criteriaPairs(args.slice(1));
	return alignedNumbers(values, (index) => pairs.every((pair) => pair.predicate(pair.values[index])));
}

/** Averages one aligned range using a single criterion. */
function averageIf(args) {
	const criteria = flattenValues([args[0]]);
	const values = flattenValues([args[2] ?? args[0]]);
	return alignedAverage(values, (index) => criteriaPredicate(args[1])(criteria[index]));
}

/** Averages one range using multiple aligned criteria. */
function averageIfs(args) {
	const values = flattenValues([args[0]]);
	const pairs = criteriaPairs(args.slice(1));
	return alignedAverage(values, (index) => pairs.every((pair) => pair.predicate(pair.values[index])));
}

/** Converts alternating range/criterion arguments into aligned predicate pairs. */
function criteriaPairs(args) {
	const pairs = [];
	for (let index = 0; index + 1 < args.length; index += 2) {
		pairs.push({
			predicate: criteriaPredicate(args[index + 1]),
			values: flattenValues([args[index]])
		});
	}
	return pairs;
}

/** Sums numeric values whose aligned index predicate passes. */
function alignedNumbers(values, matches) {
	let total = 0;
	for (let index = 0; index < values.length; index += 1) {
		if (!matches(index)) continue;
		const number = toNumber(values[index]);
		if (!isFormulaError(number)) total += number;
	}
	return total;
}

/** Averages numeric values whose aligned index predicate passes. */
function alignedAverage(values, matches) {
	let total = 0;
	let count = 0;
	for (let index = 0; index < values.length; index += 1) {
		if (!matches(index)) continue;
		const number = toNumber(values[index]);
		if (isFormulaError(number)) continue;
		total += number;
		count += 1;
	}
	return count ? total / count : formulaError("#DIV/0!");
}
