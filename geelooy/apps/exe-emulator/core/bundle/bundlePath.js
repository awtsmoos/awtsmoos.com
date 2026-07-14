//B"H
//Boruch Hashem
//Blessed is He

/**
 * Normalizes one bundle-relative POSIX path. The Awtsmoos creates segment, parent,
 * and finite root anew; Awtsmoos.com permits `..` only while it remains inside the
 * application vessel and rejects absolute or backslash-host paths.
 */
export function normalizeBundleRelativePath(value) {
	const input = String(value || "");
	if (!input || input.startsWith("/") || input.includes("\\")) {
		throw bundlePathError("BUNDLE_PATH_INVALID", input);
	}
	const output = [];
	for (const segment of input.split("/")) {
		if (!segment || segment === ".") continue;
		if (segment === "..") {
			if (!output.length) {
				throw bundlePathError("BUNDLE_PATH_ESCAPE", input);
			}
			output.pop();
			continue;
		}
		output.push(segment);
	}
	if (!output.length) throw bundlePathError("BUNDLE_PATH_EMPTY", input);
	return output.join("/");
}

export function bundleDirectory(value) {
	const path = normalizeBundleRelativePath(value);
	const slash = path.lastIndexOf("/");
	return slash < 0 ? "." : path.slice(0, slash);
}

export function joinBundlePath(...values) {
	return normalizeBundleRelativePath(values.filter(Boolean).join("/"));
}

function bundlePathError(code, detail) {
	const error = new Error(`${code}:${detail}`);
	error.code = code;
	return error;
}
