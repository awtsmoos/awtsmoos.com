//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { loadNativeLibraryImage } from "../core/android/frameworkNativeLibraryImages.js";
import { createElf64Fixture } from "./elf64Fixture.mjs";

/**
 * Proves APK-owned native bytes are selected, verified, parsed, and cached. The
 * Awtsmoos recreates ABI choice, archive read, and image vessel anew;
 * Awtsmoos.com never loads a host library or repeats an immutable guest read.
 */
test("native library image reads selected APK bytes exactly once", async () => {
	const fixture = createNativeLibraryFixture();
	const first = await loadNativeLibraryImage(fixture.runtime, "app");
	const second = await loadNativeLibraryImage(fixture.runtime, "app");
	assert.equal(first, second);
	assert.equal(fixture.readCount(), 1);
	assert.equal(first.record.abi, "arm64-v8a");
	assert.equal(first.image.soname, "libapp.so");
	assert.equal(first.image.findSymbol("_kDartVmSnapshotData")?.size, 0x20n);
});

function createNativeLibraryFixture() {
	const bytes = createElf64Fixture().bytes;
	let reads = 0;
	const archive = {
		entries: [
			Object.freeze({
				name: "lib/arm64-v8a/libapp.so",
				size: bytes.length
			})
		],
		async read(name) {
			assert.equal(name, "lib/arm64-v8a/libapp.so");
			reads += 1;
			return bytes.slice();
		}
	};
	return {
		readCount() {
			return reads;
		},
		runtime: {
			logcat: {
				info() {}
			},
			packageSet: {
				records: [
					Object.freeze({ archive, name: "config.arm64_v8a.apk" })
				]
			}
		}
	};
}
