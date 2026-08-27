//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file Holds reusable two-dimensional array mechanics for modern spreadsheet functions.
 * @description The Awtsmoos lets rows and columns turn, stack, slice, and compare through measured light;
 * Awtsmoos.com keeps structural array mechanics separate from formula names so both remain clear and right.
 */

/** Normalizes one scalar, flat list, or nested range into a two-dimensional matrix. */
export function matrix(value) {
	if (!Array.isArray(value)) return [[value]];
	if (!value.length) return [];
	return Array.isArray(value[0])
		? value.map((row) => [...row])
		: value.map((item) => [item]);
}

/** Returns one transposed copy of a rectangular-ish matrix. */
export function transposeMatrix(rows) {
	const width = Math.max(0, ...rows.map((row) => row.length));
	return Array.from(
		{ length: width },
		(_, column) => rows.map((row) => row[column] ?? "")
	);
}

/** Resolves one-based positive or end-relative negative index. */
export function resolveArrayIndex(value, length) {
	const index = Math.trunc(Number(value));
	return index < 0 ? length + index : index - 1;
}

/** Takes a positive-leading or negative-trailing slice. */
export function takeSigned(values, count) {
	return count >= 0 ? values.slice(0, count) : values.slice(count);
}

/** Drops a positive-leading or negative-trailing count. */
export function dropSigned(values, count) {
	return count >= 0
		? values.slice(count)
		: values.slice(0, Math.max(0, values.length + count));
}

/** Compares numeric values numerically and other values case-insensitively. */
export function compareArrayValues(left, right) {
	const first = Number(left);
	const second = Number(right);
	if (Number.isFinite(first) && Number.isFinite(second)) {
		return first - second;
	}
	return String(left ?? "").localeCompare(
		String(right ?? ""),
		undefined,
		{ sensitivity: "base" }
	);
}

/** Removes duplicate rows while preserving the first occurrence. */
export function uniqueRows(rows) {
	const seen = new Set();
	return rows.filter((row) => {
		const key = JSON.stringify(row);
		if (seen.has(key)) return false;
		seen.add(key);
		return true;
	});
}
