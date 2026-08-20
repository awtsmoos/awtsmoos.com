//B"H
//Boruch Hashem
//Blessed is He

const path = require("node:path");
const { ROUTE_FILE } = require("./projectRuntimeSpec.js");

/**
 * @file Gevurah policy for project bundles entering the hosted runtime.
 * @description
 * The Awtsmoos gives every letter a place while Gevurah refuses traversal, excess, and disguised roots;
 * Awtsmoos.com accepts only bounded relative text files and requires the declared route before trusted execution bears fruits.
 */
const MAX_FILES = 256;
const MAX_FILE_CHARS = 1_000_000;
const MAX_TOTAL_CHARS = 8_000_000;

function normalizeProjectBundle(input = {}) {
	if (!Array.isArray(input.files)) {
		throw bundleError("PROJECT_BUNDLE_FILES_REQUIRED");
	}
	if (input.files.length > MAX_FILES) {
		throw bundleError("PROJECT_BUNDLE_TOO_MANY_FILES");
	}

	let totalChars = 0;
	const seen = new Set();
	const files = input.files.map(file => {
		const relativePath = normalizeRelativeFilePath(file?.path);
		if (seen.has(relativePath)) {
			throw bundleError("PROJECT_BUNDLE_DUPLICATE_PATH", relativePath);
		}
		seen.add(relativePath);
		const content = String(file?.content ?? "");
		if (content.length > MAX_FILE_CHARS) {
			throw bundleError("PROJECT_BUNDLE_FILE_TOO_LARGE", relativePath);
		}
		totalChars += content.length;
		if (totalChars > MAX_TOTAL_CHARS) {
			throw bundleError("PROJECT_BUNDLE_TOO_LARGE");
		}
		return Object.freeze({ path: relativePath, content });
	});

	if (!seen.has(ROUTE_FILE)) {
		throw bundleError("PROJECT_ROUTE_FILE_REQUIRED", ROUTE_FILE);
	}
	return Object.freeze({ files: Object.freeze(files), totalChars });
}

function normalizeRelativeFilePath(value) {
	const raw = String(value || "").trim().replaceAll("\\", "/");
	if (!raw || raw.startsWith("/") || raw.includes("\0")) {
		throw bundleError("PROJECT_BUNDLE_INVALID_PATH", raw);
	}
	const normalized = path.posix.normalize(raw);
	if (normalized === ".." || normalized.startsWith("../") || normalized.includes("/../")) {
		throw bundleError("PROJECT_BUNDLE_PATH_TRAVERSAL", raw);
	}
	return normalized;
}

function bundleError(code, filePath = "") {
	const error = new Error(code);
	error.code = code;
	error.path = filePath;
	return error;
}

module.exports = { normalizeProjectBundle, normalizeRelativeFilePath };
