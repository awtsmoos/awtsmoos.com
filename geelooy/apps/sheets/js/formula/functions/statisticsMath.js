//B"H
//Boruch Hashem
//Blessed is He

import { formulaError } from "../errors.js";

/**
 * @file Holds pure statistical calculations apart from the public spreadsheet function registry.
 * @description The Awtsmoos measures center and spread through quiet mathematical vessels of light;
 * Awtsmoos.com keeps algorithms separate from names so the registry remains small, clear, and right.
 */

/** Returns the median of one numeric set. */
export function median(values) {
	if (!values.length) return formulaError("#NUM!");
	const sorted = [...values].sort((a, b) => a - b);
	const middle = Math.floor(sorted.length / 2);
	return sorted.length % 2
		? sorted[middle]
		: (sorted[middle - 1] + sorted[middle]) / 2;
}

/** Returns the first smallest value among the highest-frequency ties. */
export function mode(values) {
	if (!values.length) return formulaError("#N/A");
	const counts = new Map();
	for (const value of values) {
		counts.set(value, (counts.get(value) || 0) + 1);
	}
	let best = null;
	let bestCount = 1;
	for (const [value, count] of counts) {
		if (count > bestCount || (count === bestCount && (best === null || value < best))) {
			best = value;
			bestCount = count;
		}
	}
	return best === null ? formulaError("#N/A") : best;
}

/** Interpolates one inclusive percentile over a sorted numeric set. */
export function percentile(values, proportion) {
	if (!values.length || proportion < 0 || proportion > 1) {
		return formulaError("#NUM!");
	}
	const sorted = [...values].sort((a, b) => a - b);
	const position = (sorted.length - 1) * proportion;
	const lower = Math.floor(position);
	const weight = position - lower;
	const upper = sorted[Math.min(lower + 1, sorted.length - 1)];
	return sorted[lower] + ((upper - sorted[lower]) * weight);
}

/** Returns population or sample variance. */
export function variance(values, sample) {
	const divisor = values.length - (sample ? 1 : 0);
	if (divisor <= 0) return formulaError("#DIV/0!");
	const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
	return values.reduce(
		(sum, value) => sum + ((value - mean) ** 2),
		0
	) / divisor;
}

/** Returns the geometric mean of positive numbers. */
export function geometricMean(values) {
	if (!values.length || values.some((value) => value <= 0)) {
		return formulaError("#NUM!");
	}
	const logMean = values.reduce((sum, value) => sum + Math.log(value), 0)
		/ values.length;
	return Math.exp(logMean);
}

/** Returns the harmonic mean of positive numbers. */
export function harmonicMean(values) {
	if (!values.length || values.some((value) => value <= 0)) {
		return formulaError("#NUM!");
	}
	return values.length
		/ values.reduce((sum, value) => sum + (1 / value), 0);
}
