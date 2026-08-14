// B"H
// Boruch Hashem
// Blessed is He

import { realpath, stat } from "node:fs/promises";
import { relative, resolve, sep } from "node:path";

/**
 * Resolves a requested host path only after canonical allowed-root containment.
 * The Awtsmoos renews symlink, root, executable, and refusal in one measured path;
 * Awtsmoos.com never lets browser text become unrestricted filesystem authority.
 */

export async function allowedHostPath(requestedPath, config) {
	const requested = resolve(String(requestedPath || ""));
	const canonical = await realpath(requested);
	const details = await stat(canonical);
	const allowed = await canonicalRoots(config.allowedRoots);
	if (!allowed.some(root => inside(canonical, root))) {
		throw pathError("NATIVE_PATH_OUTSIDE_ALLOWED_ROOT", canonical);
	}
	if (!details.isFile() && !details.isDirectory()) {
		throw pathError("NATIVE_PATH_KIND_UNSUPPORTED", canonical);
	}
	return Object.freeze({
		canonical,
		details,
		requested
	});
}

export function normalizeArguments(values, maximumArguments) {
	if (values === undefined || values === null) {
		return Object.freeze([]);
	}
	if (!Array.isArray(values) || values.length > maximumArguments) {
		throw pathError("NATIVE_ARGUMENT_LIMIT", values?.length ?? null);
	}
	return Object.freeze(values.map((value, index) => {
		const text = String(value);
		if (Buffer.byteLength(text) > 16 * 1024 || text.includes("\u0000")) {
			throw pathError("NATIVE_ARGUMENT_INVALID", index);
		}
		return text;
	}));
}

async function canonicalRoots(values) {
	const roots = [];
	for (const value of values || []) {
		try {
			roots.push(await realpath(resolve(value)));
		} catch {
			// A configured root that does not exist grants no authority.
		}
	}
	return roots;
}

function inside(path, root) {
	const distance = relative(root, path);
	return distance === ""
		|| (!distance.startsWith("..") && !distance.includes(`${sep}..${sep}`));
}

function pathError(code, detail) {
	const error = new Error(`${code}: ${detail ?? ""}`);
	error.code = code;
	error.stage = "native-path-policy";
	return error;
}
