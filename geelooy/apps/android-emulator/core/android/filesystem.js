//B"H
//Boruch Hashem
//Blessed is He

/**
 * Creates a package-scoped virtual Android filesystem. The Awtsmoos creates path,
 * directory, bytes, and audit event anew; Awtsmoos.com permits no host-device write
 * unless a separate capability mount explicitly accepts the normalized guest path.
 */
export function createAndroidFilesystem(packageName, options = {}) {
	const root = `/data/data/${normalizePackage(packageName)}`;
	const files = new Map();
	const audit = [];
	const maximumBytes = Number(options.maximumFilesystemBytes || 128 * 1024 * 1024);
	let usedBytes = 0;
	return Object.freeze({
		delete(path) {
			const normalized = normalizePath(path, root);
			const previous = files.get(normalized);
			if (!previous) return false;
			usedBytes -= previous.length;
			files.delete(normalized);
			record("delete", normalized, 0);
			return true;
		},
		exists(path) {
			return files.has(normalizePath(path, root));
		},
		list(prefix = root) {
			const normalized = normalizePath(prefix, root);
			return Object.freeze([...files.keys()].filter(path => path.startsWith(normalized)).sort());
		},
		read(path) {
			const normalized = normalizePath(path, root);
			const bytes = files.get(normalized);
			if (!bytes) throw filesystemError("ANDROID_FILE_MISSING", normalized);
			record("read", normalized, bytes.length);
			return bytes.slice();
		},
		root,
		snapshot() {
			return Object.freeze({
				audit: Object.freeze(audit.slice()),
				fileCount: files.size,
				paths: Object.freeze([...files.keys()].sort()),
				root,
				usedBytes
			});
		},
		async syncToCapability(capability) {
			if (!capability?.write) throw filesystemError("ANDROID_HOST_WRITE_CAPABILITY_MISSING");
			for (const [path, bytes] of files) await capability.write(path, bytes.slice());
			record("sync", root, usedBytes);
		},
		write(path, input) {
			const normalized = normalizePath(path, root);
			const bytes = input instanceof Uint8Array ? input.slice() : new TextEncoder().encode(String(input));
			const previous = files.get(normalized);
			const nextUsed = usedBytes - (previous?.length || 0) + bytes.length;
			if (nextUsed > maximumBytes) throw filesystemError("ANDROID_FILESYSTEM_LIMIT", String(nextUsed));
			files.set(normalized, bytes);
			usedBytes = nextUsed;
			record("write", normalized, bytes.length);
			return bytes.length;
		}
	});

	function record(operation, path, size) {
		audit.push(Object.freeze({ operation, path, sequence: audit.length, size }));
	}
}

function normalizePath(value, root) {
	const input = String(value || "");
	const absolute = input.startsWith("/") ? input : `${root}/${input}`;
	const segments = absolute.split("/").filter(Boolean);
	const normalized = `/${segments.join("/")}`;
	if (!normalized.startsWith(`${root}/`) && normalized !== root) {
		throw filesystemError("ANDROID_FILE_OUTSIDE_PACKAGE", normalized);
	}
	if (segments.some(segment => segment === "." || segment === "..")) {
		throw filesystemError("ANDROID_FILE_TRAVERSAL", input);
	}
	return normalized;
}

function normalizePackage(value) {
	const name = String(value || "");
	if (!/^[A-Za-z][A-Za-z0-9_.]*$/.test(name)) throw filesystemError("ANDROID_PACKAGE_INVALID", name);
	return name;
}

function filesystemError(code, detail = "") {
	const error = new Error(detail ? `${code}:${detail}` : code);
	error.code = code;
	return error;
}
