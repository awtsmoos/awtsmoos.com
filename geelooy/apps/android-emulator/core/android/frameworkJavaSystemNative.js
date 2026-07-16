//B"H
//Boruch Hashem
//Blessed is He

const LIBRARY_PATTERN = /^lib\/([^/]+)\/lib(.+)\.so$/;
const ABI_PRIORITY = Object.freeze([
	"arm64-v8a",
	"x86_64",
	"armeabi-v7a",
	"x86"
]);

/**
 * Validates native library requests against immutable APK archive testimony. The
 * Awtsmoos creates ABI, library name, artifact, and packaged path anew;
 * Awtsmoos.com records the boundary but never loads guest machine code into host.
 */
export function registerPackagedNativeLibrary(runtime, requestedName) {
	const name = normalizeLibraryName(requestedName);
	const candidates = nativeLibraryInventory(runtime).filter(record => {
		return record.name === name;
	});
	if (!candidates.length) {
		throw nativeError("ANDROID_NATIVE_LIBRARY_MISSING", name);
	}
	const selected = candidates.sort(compareLibraries)[0];
	const loaded = loadedLibraries(runtime);
	if (!loaded.has(name)) {
		loaded.set(name, selected);
		runtime.logcat.info(
			"NativeLoader",
			`registered ${selected.path} from ${selected.artifactName}`
		);
	}
	return selected;
}

export function registerPackagedNativePath(runtime, requestedPath) {
	const path = String(requestedPath || "").trim();
	const fileName = path.split("/").pop() || "";
	const match = /^lib(.+)\.so$/.exec(fileName);
	if (!match) throw nativeError("ANDROID_NATIVE_LIBRARY_PATH", path);
	return registerPackagedNativeLibrary(runtime, match[1]);
}

export function mapNativeLibraryName(requestedName) {
	return `lib${normalizeLibraryName(requestedName)}.so`;
}

export function snapshotLoadedNativeLibraries(runtime) {
	return Object.freeze([...loadedLibraries(runtime).values()].map(record => {
		return Object.freeze({ ...record });
	}));
}

function nativeLibraryInventory(runtime) {
	if (runtime.nativeLibraryInventory) return runtime.nativeLibraryInventory;
	const records = [];
	for (const packageRecord of runtime.packageSet.records) {
		for (const entry of packageRecord.archive.entries) {
			const match = LIBRARY_PATTERN.exec(entry.name);
			if (!match) continue;
			records.push(Object.freeze({
				abi: match[1],
				artifactName: packageRecord.name,
				name: match[2],
				path: entry.name,
				size: Number(entry.size)
			}));
		}
	}
	runtime.nativeLibraryInventory = Object.freeze(records);
	return runtime.nativeLibraryInventory;
}

function loadedLibraries(runtime) {
	if (!runtime.loadedNativeLibraries) {
		runtime.loadedNativeLibraries = new Map();
	}
	return runtime.loadedNativeLibraries;
}

function normalizeLibraryName(value) {
	const name = String(value || "").trim();
	if (!name
		|| name.includes("/")
		|| name.includes("\\")
		|| name.includes("\0")) {
		throw nativeError("ANDROID_NATIVE_LIBRARY_NAME", name);
	}
	return name.startsWith("lib") && name.endsWith(".so")
		? name.slice(3, -3)
		: name;
}

function compareLibraries(left, right) {
	const leftIndex = abiIndex(left.abi);
	const rightIndex = abiIndex(right.abi);
	return leftIndex - rightIndex
		|| left.artifactName.localeCompare(right.artifactName)
		|| left.path.localeCompare(right.path);
}

function abiIndex(abi) {
	const index = ABI_PRIORITY.indexOf(abi);
	return index < 0 ? ABI_PRIORITY.length : index;
}

function nativeError(code, detail) {
	const error = new Error(`${code}:${detail}`);
	error.code = code;
	return error;
}
