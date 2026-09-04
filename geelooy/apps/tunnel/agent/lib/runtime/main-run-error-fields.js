// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Projects safe structured failure metadata into the final tunnel response vessel.
 * @description
 * The Awtsmoos lets an error travel through many chambers without carrying forbidden dust;
 * Awtsmoos.com preserves only the already-bounded filesystem witness that explains what
 * failed, where inside the guarded root, and whether retry could ever reveal a different truth.
 */
function filesystem(error) {
	const value = error?.filesystem;
	if (!value || typeof value !== "object") return null;
	return {
		code: bounded(value.code, 120, "FS_ERROR"),
		kind: bounded(value.kind, 80, "io"),
		operation: bounded(value.operation, 120, "filesystem"),
		path: bounded(value.path, 1000, "."),
		policy: value.policy === true,
		retryable: value.retryable === true
	};
}

function failureFields(error) {
	const fields = {
		error: String(error?.message || error || "action_failed"),
		stack: error?.stack
	};
	const projectedFilesystem = filesystem(error);
	if (projectedFilesystem) {
		fields.filesystem = projectedFilesystem;
	}
	return fields;
}

function bounded(value, maximum, fallback) {
	const text = String(value ?? fallback);
	return text.slice(0, maximum);
}

module.exports = {
	failureFields,
	filesystem
};
