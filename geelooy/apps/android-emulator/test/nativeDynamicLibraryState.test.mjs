//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createNativeDynamicLibraryState } from "../core/native/nativeDynamicLibraryState.js";
import { createNativeDynamicLinkerState } from "../core/native/nativeDynamicLinkerState.js";
import { createNativeHeap } from "../core/native/nativeHeap.js";
import { createNativeImportAddressSpace } from "../core/native/nativeImportAddressSpace.js";
import { readNativeCString } from "../core/native/nativeCString.js";

test("authentic imported libraries open with stable reference counts", () => {
	const fixture = createFixture();
	const first = fixture.libraries.open(1n, "libandroid.so", 2n);
	const second = fixture.libraries.open(1n, "/system/lib64/libandroid.so", 2n);
	assert.equal(first.success, true);
	assert.equal(second.handle, first.handle);
	assert.equal(second.references, 2);
});

test("mapped libapp opens and dlsym returns real ELF data address", () => {
	const fixture = createFixture();
	const opened = fixture.libraries.open(2n, "/data/app/libapp.so", 2n);
	assert.equal(opened.success, true);
	const symbol = fixture.libraries.symbol(2n, opened.handle, "kDartVmSnapshotData");
	assert.deepEqual(symbol, {
		address: 0x100000340n,
		library: "libapp.so",
		mapped: true,
		resolvedSymbol: "_kDartVmSnapshotData",
		success: true,
		symbol: "kDartVmSnapshotData"
	});
	assert.equal(fixture.imports.find(symbol.address), null);
});

test("unknown mapped symbols and libraries expose consumable errors", () => {
	const fixture = createFixture();
	assert.equal(fixture.libraries.open(3n, "libmissing.so", 2n).success, false);
	assert.match(readNativeCString(fixture.heap, fixture.errors.take(3n)).text, /cannot open/);
	const opened = fixture.libraries.open(3n, "libapp.so", 2n);
	assert.equal(fixture.libraries.symbol(3n, opened.handle, "missing").success, false);
	assert.match(readNativeCString(fixture.heap, fixture.errors.take(3n)).text, /undefined symbol/);
});

test("nonmapped dlsym retains shared host import traps", () => {
	const fixture = createFixture();
	const opened = fixture.libraries.open(4n, "libandroid.so", 2n);
	const symbol = fixture.libraries.symbol(4n, opened.handle, "ALooper_prepare");
	assert.equal(symbol.address, fixture.imports.resolve("ALooper_prepare"));
	assert.equal(symbol.mapped, false);
	assert.equal(fixture.libraries.close(4n, opened.handle).success, true);
});

function createFixture() {
	const heap = createNativeHeap(0x5000n, 0x3000);
	const errors = createNativeDynamicLinkerState(heap);
	const imports = createNativeImportAddressSpace({ base: 0x9000n });
	imports.resolve("existing", { neededLibraries: ["libandroid.so"] });
	const image = { findSymbol: name => name === "_kDartVmSnapshotData"
		? { value: 0x340n }
		: null };
	const libraries = createNativeDynamicLibraryState({
		errors,
		imports,
		mappedLibraries: [{ aliases: ["/data/app/libapp.so"], image,
			library: "libapp.so", loadBias: 0x100000000n }]
	});
	return { errors, heap, imports, libraries };
}
