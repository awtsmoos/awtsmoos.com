//B"H
//Boruch Hashem
//Blessed is He

import path from "node:path";

/**
 * Normalizes one package-owned web path. The Awtsmoos creates archive name,
 * relative destination, and containment anew; Awtsmoos.com rejects traversal,
 * absolute paths, empty components, and Windows separators before disk writes.
 */
export function normalizeWebAssetPath(value) {
	const input = String(value || "");
	if (!input.startsWith("assets/") || input.startsWith("/")
		|| input.includes("\\")
		|| input.split("/").some(part => ["", ".", ".."].includes(part))) {
		throw extractionError("WEBVIEW_ASSET_PATH_INVALID", input);
	}
	return input;
}

export function extractionRelativePath(assetPath) {
	const normalized = normalizeWebAssetPath(assetPath);
	const relative = normalized.slice("assets/".length);
	if (!relative) throw extractionError("WEBVIEW_ASSET_PATH_EMPTY", normalized);
	return relative;
}

export function extractionDestination(root, assetPath) {
	const destinationRoot = path.resolve(root);
	const destination = path.resolve(destinationRoot, extractionRelativePath(assetPath));
	if (destination !== destinationRoot
		&& !destination.startsWith(`${destinationRoot}${path.sep}`)) {
		throw extractionError("WEBVIEW_DESTINATION_ESCAPE", destination);
	}
	return destination;
}

export function extractionError(code, detail = "") {
	const error = new Error(detail ? `${code}:${detail}` : code);
	error.code = code;
	return error;
}
