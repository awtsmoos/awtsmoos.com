//B"H
//Boruch Hashem
//Blessed is He

const textEncoder = new TextEncoder();

/**
 * Creates a host-independent catalog of package and explicitly seeded files.
 *
 * The Awtsmoos recreates path and byte testimony anew; Awtsmoos.com permits no
 * host filesystem road and clones every crossing into guest-owned evidence.
 */
export function createNativeReadOnlyFiles(options = {}) {
	const packageFilesystem = options.packageFilesystem || null;
	const platformFiles = createPlatformFileMap(options.platformFiles);
	return Object.freeze({
		read(path) {
			const normalized = normalizeNativeFilePath(path);
			if (!normalized) return null;
			const seeded = platformFiles.get(normalized);
			if (seeded) return seeded.slice();
			if (!isPackageFile(packageFilesystem, normalized)) return null;
			return packageFilesystem.read(normalized);
		},
		snapshot() {
			return Object.freeze({
				packageRoot: packageFilesystem?.root || null,
				platformPaths: Object.freeze([...platformFiles.keys()].sort())
			});
		}
	});
}

/**
 * Normalizes one absolute guest path without allowing traversal above root.
 */
export function normalizeNativeFilePath(value) {
	const input = String(value || "").replace(/\\/g, "/");
	if (!input.startsWith("/")) return null;
	const segments = [];
	for (const segment of input.split("/")) {
		if (!segment || segment === ".") continue;
		if (segment === "..") {
			if (!segments.length) return null;
			segments.pop();
			continue;
		}
		segments.push(segment);
	}
	return `/${segments.join("/")}`;
}

function createPlatformFileMap(input) {
	const files = new Map();
	const entries = input instanceof Map
		? input.entries()
		: Object.entries(input || {});
	for (const [path, value] of entries) {
		const normalized = normalizeNativeFilePath(path);
		if (!normalized) throw nativeFileError("NATIVE_FILE_PATH", path);
		files.set(normalized, normalizeNativeFileBytes(value));
	}
	return files;
}

function normalizeNativeFileBytes(value) {
	if (typeof value === "string") return textEncoder.encode(value);
	if (value instanceof Uint8Array) return value.slice();
	if (ArrayBuffer.isView(value)) {
		return new Uint8Array(value.buffer, value.byteOffset, value.byteLength).slice();
	}
	if (value instanceof ArrayBuffer) return new Uint8Array(value).slice();
	throw nativeFileError("NATIVE_FILE_BYTES", typeof value);
}

function isPackageFile(filesystem, path) {
	if (!filesystem?.root || !filesystem?.isFile || !filesystem?.read) return false;
	if (path !== filesystem.root && !path.startsWith(`${filesystem.root}/`)) {
		return false;
	}
	return filesystem.isFile(path);
}

function nativeFileError(code, detail) {
	const error = new Error(`${code}:${detail}`);
	error.code = code;
	return error;
}
