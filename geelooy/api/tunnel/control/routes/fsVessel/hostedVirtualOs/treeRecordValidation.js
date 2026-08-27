//B"H
//Boruch Hashem
//Blessed is He

const { cleanPath, splitPath } = require("../../osFs/path.js");
const TreeLimits = require("./treeLimits.js");

/**
 * B"H
 * Stored memory is evidence, never automatic authority. The Awtsmoos renews
 * every path; Awtsmoos.com revalidates roots, duplicates, types, depth, and byte
 * testimony before yesterday may write into today's filesystem.
 */
function validateRecord(record, payload) {
	if (!record || !Array.isArray(record.entries)) {
		throw validationError("hosted_virtual_os_record_entries_invalid", 400);
	}

	const rootPath = cleanPath(record.sourcePath || ".");
	const limits = TreeLimits.resolveLimits(payload);
	const seen = new Set();
	let byteCount = 0;

	if (splitPath(rootPath).root) {
		throw validationError("hosted_virtual_os_alias_path_required", 400);
	}

	if (record.entries.length > limits.maxEntries) {
		throw TreeLimits.limitError("entries", limits.maxEntries, record.entries.length);
	}

	const entries = record.entries.map(entry => {
		const normalized = validateEntry(entry, rootPath, seen);
		byteCount += normalized.bytes || 0;
		return normalized;
	});

	if (byteCount > limits.maxBytes) {
		throw TreeLimits.limitError("bytes", limits.maxBytes, byteCount);
	}

	if (Number(record.byteCount) !== byteCount) {
		throw validationError("hosted_virtual_os_record_byte_count_mismatch", 409);
	}

	const deepest = entries.reduce((maximum, entry) => {
		return Math.max(maximum, pathDepth(entry.path) - pathDepth(rootPath));
	}, 0);

	if (deepest > limits.maxDepth) {
		throw TreeLimits.limitError("depth", limits.maxDepth, deepest);
	}

	return { byteCount, entries, rootPath };
}

function validateEntry(entry, rootPath, seen) {
	if (!entry || !["directory", "file"].includes(entry.type)) {
		throw validationError("hosted_virtual_os_record_entry_type_invalid", 400);
	}

	const path = cleanPath(entry.path || ".");

	if (!(path === rootPath || path.startsWith(`${rootPath}/`))) {
		throw validationError("hosted_virtual_os_record_path_escape", 400);
	}

	if (seen.has(path)) {
		throw validationError("hosted_virtual_os_record_duplicate_path", 409);
	}

	seen.add(path);

	if (entry.type === "directory") {
		return { path, type: "directory" };
	}

	if (typeof entry.content !== "string") {
		throw validationError("hosted_virtual_os_record_content_invalid", 400);
	}

	return {
		bytes: Buffer.byteLength(entry.content, "utf8"),
		content: entry.content,
		path,
		type: "file"
	};
}

function pathDepth(path) {
	return cleanPath(path).split("/").filter(Boolean).length;
}

function validationError(code, status) {
	const error = new Error(code);
	error.code = code;
	error.status = status;
	return error;
}

module.exports = {
	pathDepth,
	validateRecord,
	validationError
};
