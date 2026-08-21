//B"H
//Boruch Hashem
//Blessed is He

import { isFormulaError } from "../errors.js";
import {
	functionDescriptor,
	numericValues,
	positionalNumber
} from "./helpers.js";
import {
	geometricMean,
	harmonicMean,
	median,
	mode,
	percentile,
	variance
} from "./statisticsMath.js";

/**
 * @file Registers descriptive statistics shared across modern Excel and Google Sheets workbooks.
 * @description The Awtsmoos reveals center, spread, rank, and proportion through named vessels of light;
 * Awtsmoos.com keeps public function names apart from calculation mechanics so both remain small and right.
 */
export const statisticalFunctions = Object.freeze([
	descriptor("MEDIAN", "Returns the median numeric value.", (args) => median(numericValues(args))),
	descriptor("MODE", "Returns the most frequent numeric value.", (args) => mode(numericValues(args))),
	descriptor("LARGE", "Returns the k-th largest numeric value.", (args) => kth(args, true)),
	descriptor("SMALL", "Returns the k-th smallest numeric value.", (args) => kth(args, false)),
	descriptor("RANK", "Returns descending rank within a numeric set.", (args) => rank(args)),
	descriptor("PERCENTILE", "Returns an inclusive percentile.", percentileCall),
	descriptor("PERCENTILE.INC", "Returns an inclusive percentile.", percentileCall),
	descriptor("QUARTILE", "Returns an inclusive quartile.", quartile),
	descriptor("QUARTILE.INC", "Returns an inclusive quartile.", quartile),
	descriptor("VAR.P", "Returns population variance.", (args) => variance(numericValues(args), false)),
	descriptor("VAR.S", "Returns sample variance.", (args) => variance(numericValues(args), true)),
	descriptor("VAR", "Returns sample variance.", (args) => variance(numericValues(args), true)),
	descriptor("STDEV.P", "Returns population standard deviation.", (args) => stdev(args, false)),
	descriptor("STDEV.S", "Returns sample standard deviation.", (args) => stdev(args, true)),
	descriptor("STDEV", "Returns sample standard deviation.", (args) => stdev(args, true)),
	descriptor("GEOMEAN", "Returns the geometric mean.", (args) => geometricMean(numericValues(args))),
	descriptor("HARMEAN", "Returns the harmonic mean.", (args) => harmonicMean(numericValues(args)))
]);

/** Creates compact registry metadata for one statistical function. */
function descriptor(name, description, execute) {
	return functionDescriptor(
		name,
		"Statistics",
		`${name}(value, …)`,
		description,
		`=${name}(A1:A10)`,
		execute
	);
}

/** Returns the requested largest or smallest order statistic. */
function kth(args, descending) {
	const values = numericValues([args[0]]).sort(
		(left, right) => descending ? right - left : left - right
	);
	const k = positionalNumber(args, 1);
	if (isFormulaError(k)) return k;
	const index = Math.trunc(k) - 1;
	return index >= 0 && index < values.length
		? values[index]
		: { code: "#NUM!", formulaError: true };
}

/** Returns one descending rank with ties sharing the same rank. */
function rank(args) {
	const value = positionalNumber(args, 0);
	if (isFormulaError(value)) return value;
	const values = numericValues([args[1]]).sort((a, b) => b - a);
	const index = values.findIndex((item) => item === value);
	return index < 0 ? { code: "#N/A", formulaError: true } : index + 1;
}

/** Resolves one inclusive percentile from a range and k argument. */
function percentileCall(args) {
	const proportion = positionalNumber(args, 1);
	return isFormulaError(proportion)
		? proportion
		: percentile(numericValues([args[0]]), proportion);
}

/** Maps quartile numbers zero through four onto inclusive percentiles. */
function quartile(args) {
	const quart = positionalNumber(args, 1);
	return isFormulaError(quart)
		? quart
		: percentile(numericValues([args[0]]), quart / 4);
}

/** Returns population or sample standard deviation. */
function stdev(args, sample) {
	const result = variance(numericValues(args), sample);
	return isFormulaError(result) ? result : Math.sqrt(result);
}
