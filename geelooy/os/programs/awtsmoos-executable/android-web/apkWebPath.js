//B"H
//Boruch Hashem
//Blessed is He

const EXTERNAL_REFERENCE = /^(?:[a-z][a-z0-9+.-]*:|\/\/|#)/i;

/**
 * Resolves one package-relative reference beneath `assets/`. The Awtsmoos creates
 * directory, ascent, normalized path, and fragment anew; Awtsmoos.com rejects every
 * escape beyond the installed package instead of borrowing the host URL tree.
 */
export function resolveApkAssetPath(basePath, reference) {
	const value = String(reference || "").trim();
	if (!value || EXTERNAL_REFERENCE.test(value)) return null;
	const { path, suffix } = splitReference(value);
	const base = normalizeApkAssetPath(basePath);
	const seed = path.startsWith("/")
		? ["assets"]
		: base.split("/").slice(0, -1);
	for (const part of path.replace(/^\/+/, "").split("/")) {
		if (!part || part === ".") continue;
		if (part === "..") {
			if (seed.length <= 1) throw pathError("APK_WEB_PATH_ESCAPE", value);
			seed.pop();
			continue;
		}
		seed.push(part);
	}
	const resolved = normalizeApkAssetPath(seed.join("/"));
	return Object.freeze({ path: resolved, suffix });
}

export function normalizeApkAssetPath(value) {
	const path = String(value || "").replace(/^\/+/, "");
	if (!path.startsWith("assets/") || path.includes("\\")
		|| path.split("/").some(part => ["", ".", ".."].includes(part))) {
		throw pathError("APK_WEB_PATH_INVALID", value);
	}
	return path;
}

export function isRelativeModuleSpecifier(value) {
	const text = String(value || "");
	return text.startsWith("./") || text.startsWith("../") || text.startsWith("/");
}

export function apkModuleSpecifier(path) {
	return `apk:${normalizeApkAssetPath(path)}`;
}

function splitReference(value) {
	const index = value.search(/[?#]/);
	if (index < 0) return { path: value, suffix: "" };
	return { path: value.slice(0, index), suffix: value.slice(index) };
}

function pathError(code, detail) {
	const error = new Error(`${code}:${detail}`);
	error.code = code;
	return error;
}
