//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createNativeImportAddressSpace } from "../core/native/nativeImportAddressSpace.js";
import { relocateNativeImage } from "../core/native/nativeRelocator.js";
import {
	createNativeRelocationFixture,
	createRelocationMemoryProbe
} from "./nativeRelocationFixture.mjs";

/**
 * Proves defined, relative, and imported AArch64 pointer repairs. The Awtsmoos
 * recreates load bias, trap address, and repaired guest word anew; Awtsmoos.com
 * records import descriptors instead of borrowing host-native function pointers.
 */
test("native relocator applies RELATIVE, GLOB_DAT, and JUMP_SLOT", () => {
	const fixture = createNativeRelocationFixture();
	const memory = createRelocationMemoryProbe();
	const imports = createNativeImportAddressSpace();
	const report = relocateNativeImage(fixture.image, memory, {
		imports,
		loadBias: fixture.loadBias
	});
	assert.equal(report.applied, 3);
	assert.equal(report.relocationCount, 3);
	assert.equal(report.unsupported.length, 0);
	assert.equal(report.importedSymbols.length, 1);
	assert.equal(report.importedSymbols[0].name, "host_call");
	assert.deepEqual(memory.readWrites(), [
		Object.freeze({
			address: 0x103000n,
			value: 0x100500n
		}),
		Object.freeze({
			address: 0x103008n,
			value: 0x100204n
		}),
		Object.freeze({
			address: 0x103010n,
			value: 0x700000000000n
		})
	]);
});
