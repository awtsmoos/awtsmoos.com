// B"H

/**
 * @file api/vector/query.js
 * @chapter When The Graph Is Absent, The Living Records Still Answer
 * @description
 * Normalizes vector-like values and provides the exact-scan fallback used by
 * read-only and graph-recovery paths.
 */

function vectorOf(value) {
	if (!value) return null;
	if (value instanceof Float32Array) return value;
	if (Array.isArray(value)) return new Float32Array(value);
	const length = Number(value.length || 0);
	if (!length || !Number.isFinite(length)) return null;
	const output = new Float32Array(length);
	for (let index = 0; index < length; index++) {
		const number = Number(value[index]);
		if (!Number.isFinite(number)) return null;
		output[index] = number;
	}
	return output;
}

function rows(handle) {
	try {
		const resolved = handle?.__resolve__?.();
		if (Array.isArray(resolved)) return resolved;
	} catch (_error) {}
	const length = Number(handle?.length || 0);
	if (Number.isFinite(length) && length >= 0) {
		const output = [];
		for (let index = 0; index < length; index++) output.push(handle[index]);
		return output;
	}
	const output = [];
	try { for (const item of handle) output.push(item); } catch (_error) {}
	return output;
}

function cosine(left, right) {
	let dot = 0;
	let leftMagnitude = 0;
	let rightMagnitude = 0;
	const length = Math.min(left.length || 0, right.length || 0);
	for (let index = 0; index < length; index++) {
		dot += left[index] * right[index];
		leftMagnitude += left[index] * left[index];
		rightMagnitude += right[index] * right[index];
	}
	return dot / ((Math.sqrt(leftMagnitude) || 1) * (Math.sqrt(rightMagnitude) || 1));
}

function scanNearest(handle, query, count) {
	const output = [];
	for (const item of rows(handle)) {
		const vector = vectorOf(item?.vec || item?.embedding || item?.vector);
		if (!vector) continue;
		output.push({ score: cosine(query, vector), item });
	}
	return output.sort((left, right) => right.score - left.score).slice(0, count);
}

module.exports = {
	scanNearest,
	vectorOf
};
