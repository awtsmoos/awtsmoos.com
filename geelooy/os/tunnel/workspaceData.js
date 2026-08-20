// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Normalizes remote tunnel responses for the OS workspace.
 * @description
 * The Awtsmoos may clothe a list, file, or command output in several compatible
 * envelopes. Awtsmoos.com reads those vessels conservatively and never invents
 * filesystem entries or shell testimony that the remote route did not return.
 */

export function extractEntries(value = {}) {
	const candidates = [
		value.entries,
		value.files,
		value.items,
		value.data?.entries,
		value.data?.files,
		value.result?.entries,
		value.response
	];
	for (const candidate of candidates) {
		if (Array.isArray(candidate)) {
			return candidate.map(normalizeEntry).filter(Boolean);
		}
	}
	return [];
}

export function extractFileText(value = {}) {
	const candidates = [
		value.content,
		value.text,
		value.data?.content,
		value.data?.text,
		value.result?.content,
		value.response
	];
	for (const candidate of candidates) {
		if (typeof candidate === "string") {
			return candidate;
		}
	}
	try {
		return JSON.stringify(value, null, 2);
	} catch (_error) {
		return String(value);
	}
}

export function extractCommandOutput(receipt = {}) {
	const output = receipt.output || receipt.raw?.output || receipt.raw || receipt;
	const candidates = [
		output.stdout,
		output.output,
		output.text,
		output.response,
		output.data?.stdout,
		output.data?.output
	];
	for (const candidate of candidates) {
		if (typeof candidate === "string") {
			return candidate;
		}
	}
	try {
		return JSON.stringify(output, null, 2);
	} catch (_error) {
		return String(output);
	}
}

function normalizeEntry(value) {
	if (typeof value === "string") {
		return Object.freeze({ name: value, path: value, directory: false });
	}
	if (!value || typeof value !== "object") {
		return null;
	}
	const path = String(value.path || value.p || value.name || "");
	if (!path) {
		return null;
	}
	return Object.freeze({
		name: String(value.name || path.split("/").filter(Boolean).pop() || path),
		path,
		directory: value.directory === true || value.isDirectory === true || value.type === "directory"
	});
}
