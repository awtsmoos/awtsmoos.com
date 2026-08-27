//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createNativeMappedDynamicLibraries } from "../core/native/nativeMappedDynamicLibraries.js";

/** Proves mapped ELF lookup prefers authentic symbols and underscore aliases. */
test("mapped libraries resolve exact and Dart alias symbols", () => {
	const symbols = new Map([
		["exact", { value: 0x20n }],
		["_kDartVmSnapshotData", { value: 0x340n }]
	]);
	const mapped = createNativeMappedDynamicLibraries([{
		aliases: ["/data/app/libapp.so"],
		image: { findSymbol: name => symbols.get(name) || null },
		library: "libapp.so",
		loadBias: 0x100000000n
	}]);
	assert.equal(mapped.resolve("libapp.so", "exact").address, 0x100000020n);
	const dart = mapped.resolve(null, "kDartVmSnapshotData");
	assert.equal(dart.address, 0x100000340n);
	assert.equal(dart.resolvedSymbol, "_kDartVmSnapshotData");
	assert.equal(mapped.has("/data/app/libapp.so"), true);
	assert.equal(mapped.resolve("libapp.so", "missing"), null);
});
