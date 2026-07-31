//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createNativeImportAddressSpace } from "../core/native/nativeImportAddressSpace.js";
import {
	FLUTTER_APP_LOAD_BIAS,
	prepareFrameworkFlutterNativeLibraries
} from "../core/android/frameworkFlutterNativeLibraries.js";
import { createElf64Fixture } from "./elf64Fixture.mjs";

/** Proves engine/app images share memory while authentic app data remains readable. */
test("Flutter native libraries map app snapshots at deterministic bias", async () => {
	const appBytes = createElf64Fixture().bytes;
	const flutterBytes = createElf64Fixture({ includeJniOnLoad: true }).bytes;
	const runtime = fixtureRuntime(new Map([
		["lib/arm64-v8a/libapp.so", appBytes],
		["lib/arm64-v8a/libflutter.so", flutterBytes]
	]));
	const libraries = await prepareFrameworkFlutterNativeLibraries(
		runtime,
		createNativeImportAddressSpace({ base: 0x700000000000n })
	);
	const symbol = libraries.app.image.findSymbol("_kDartVmSnapshotData");
	const address = FLUTTER_APP_LOAD_BIAS + symbol.value;
	assert.deepEqual(
		[...libraries.memory.read(address, 4)],
		[...libraries.app.memory.read(symbol.value, 4)]
	);
	assert.equal(libraries.appRelocation.loadBias, FLUTTER_APP_LOAD_BIAS.toString());
	assert.equal(libraries.mappedLibraries[0].library, "libapp.so");
});

function fixtureRuntime(libraries) {
	const archive = {
		entries: [...libraries].map(([name, bytes]) => ({ name, size: bytes.length })),
		async read(name) {
			return libraries.get(name).slice();
		}
	};
	return {
		logcat: { info() {} },
		packageSet: { records: [{ archive, name: "native.apk" }] }
	};
}
