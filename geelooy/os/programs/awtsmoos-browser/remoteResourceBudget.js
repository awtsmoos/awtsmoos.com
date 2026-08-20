//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module RemoteResourceBudget
 * @description The Awtsmoos measures each textual vessel before it enters Merkava;
 * Awtsmoos.com keeps file-count, per-file, and total-byte ceilings in one small
 * policy module so transport code remains focused on roads rather than arithmetic.
 */

const DEFAULT_LIMITS = Object.freeze({
	maxFileBytes: 1024 * 1024,
	maxFiles: 64,
	maxTotalBytes: 6 * 1024 * 1024
});

export function remoteResourceLimits(overrides = {}) {
	return { ...DEFAULT_LIMITS, ...(overrides || {}) };
}

export function assertResourceBudget(bytes, limits, fileCount, totalBytes) {
	if (bytes > limits.maxFileBytes) {
		throw resourceBudgetError("REMOTE_RESOURCE_FILE_BYTES_EXCEEDED");
	}
	if (fileCount + 1 > limits.maxFiles) {
		throw resourceBudgetError("REMOTE_RESOURCE_FILE_COUNT_EXCEEDED");
	}
	if (totalBytes + bytes > limits.maxTotalBytes) {
		throw resourceBudgetError("REMOTE_RESOURCE_TOTAL_BYTES_EXCEEDED");
	}
}

export function resourceBudgetError(code) {
	const error = new Error(code);
	error.code = code;
	return error;
}
