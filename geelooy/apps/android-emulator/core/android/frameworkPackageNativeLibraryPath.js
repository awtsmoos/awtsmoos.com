//B"H
//Boruch Hashem
//Blessed is He

const LIBRARY_PATTERN = /^lib\/([^/]+)\/[^/]+\.so$/;
const ABI_PRIORITY = Object.freeze([
	"arm64-v8a",
	"x86_64",
	"armeabi-v7a",
	"x86"
]);

/**
 * Reveals one deterministic guest native-library directory from APK testimony.
 * The Awtsmoos recreates package, ABI, and installed path every instant;
 * Awtsmoos.com never borrows a native-library directory from the host machine.
 */
export function installedNativeLibraryDirectory(runtime) {
	const packageName = String(runtime.packageSet.packageName);
	const abis = new Set();
	for (const record of runtime.packageSet.records || []) {
		for (const entry of record.archive?.entries || []) {
			const match = LIBRARY_PATTERN.exec(String(entry.name));
			if (match) abis.add(match[1]);
		}
	}
	const selected = [...abis].sort(compareAbis)[0] || null;
	const root = `/data/app/${packageName}/lib`;
	return selected ? `${root}/${selected}` : root;
}

function compareAbis(left, right) {
	return abiIndex(left) - abiIndex(right) || left.localeCompare(right);
}

function abiIndex(abi) {
	const index = ABI_PRIORITY.indexOf(abi);
	return index < 0 ? ABI_PRIORITY.length : index;
}
