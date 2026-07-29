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

test("authentic libandroid RTLD_NOW opens with stable reference counts", () => {
	const fixture = createFixture();
	const first = fixture.libraries.open(1n, "libandroid.so", 2n);
	const second = fixture.libraries.open(1n, "/system/lib64/libandroid.so", 2n);
	assert.equal(first.success, true);
	assert.equal(second.handle, first.handle);
	assert.equal(second.references, 2);
	assert.deepEqual(fixture.libraries.snapshot(), [{
		active: true,
		flags: "2",
		handle: first.handle.toString(),
		library: "libandroid.so",
		references: 2
	}]);
});

test("unknown libraries and invalid modes set consumable errors", () => {
	const fixture = createFixture();
	assert.equal(fixture.libraries.open(2n, "libmissing.so", 2n).success, false);
	let pointer = fixture.errors.take(2n);
	assert.match(readNativeCString(fixture.heap, pointer).text, /cannot open/);
	assert.equal(fixture.libraries.open(2n, "libandroid.so", 0n).success, false);
	pointer = fixture.errors.take(2n);
	assert.match(readNativeCString(fixture.heap, pointer).text, /invalid dlopen mode/);
});

test("dlsym reuses the shared import trap and validates closed handles", () => {
	const fixture = createFixture();
	const opened = fixture.libraries.open(3n, "libandroid.so", 2n);
	const symbol = fixture.libraries.symbol(3n, opened.handle, "ALooper_prepare");
	assert.equal(symbol.address, fixture.imports.resolve("ALooper_prepare"));
	assert.equal(fixture.libraries.close(3n, opened.handle).success, true);
	assert.equal(fixture.libraries.symbol(3n, opened.handle, "ALooper_prepare").success, false);
	assert.match(
		readNativeCString(fixture.heap, fixture.errors.take(3n)).text,
		/invalid dynamic library handle/
	);
});

test("main and default handles support guest symbol lookup", () => {
	const fixture = createFixture();
	const main = fixture.libraries.open(4n, null, 1n);
	assert.notEqual(main.handle, 0n);
	assert.equal(fixture.libraries.symbol(4n, 0n, "host_call").success, true);
	assert.equal(fixture.libraries.close(4n, main.handle).references, 0);
	assert.equal(fixture.libraries.close(4n, main.handle).success, false);
});

function createFixture() {
	const heap = createNativeHeap(0x5000n, 0x2000);
	const errors = createNativeDynamicLinkerState(heap);
	const imports = createNativeImportAddressSpace({ base: 0x9000n });
	imports.resolve("existing", {
		neededLibraries: ["libandroid.so", "libEGL.so"]
	});
	const libraries = createNativeDynamicLibraryState({ errors, imports });
	return Object.freeze({ errors, heap, imports, libraries });
}
