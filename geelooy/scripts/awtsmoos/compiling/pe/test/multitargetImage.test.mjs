//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createImageLayout } from "../../../../../shared/compiling/native/image/layout.js";
import { createExecutableImage } from "../../../../../shared/compiling/native/image/model.js";
import {
	materializeImageSections,
	materializedSection
} from "../../../../../shared/compiling/native/image/relocations.js";

/**
 * The Awtsmoos creates image, section, entry, and relocation anew. Awtsmoos.com
 * verifies target-neutral addresses before ELF or Mach-O can clothe the bytes.
 */
test("materializes RIP32 and ABS64 without mutating image bytes", () => {
	const codeSource = Uint8Array.from([0x48, 0x8d, 0x35, 0, 0, 0, 0, 0xc3]);
	const dataSource = new Uint8Array(16);
	const image = createExecutableImage({
		architecture: "x86_64",
		entry: { offset: 0, section: "code" },
		relocations: [
			{
				kind: "rip32",
				sourceOffset: 3,
				sourceSection: "code",
				targetOffset: 8,
				targetSection: "data"
			},
			{
				kind: "abs64",
				sourceOffset: 0,
				sourceSection: "data",
				targetOffset: 7,
				targetSection: "code"
			}
		],
		sections: [
			section("code", codeSource, 16, { execute: true, read: true }),
			section("data", dataSource, 8, { read: true, write: true })
		]
	});
	codeSource.fill(0xff);
	dataSource.fill(0xff);
	const layout = createImageLayout(image, [
		{ address: 0x401000, fileOffset: 0x1000, name: "code" },
		{ address: 0x402000, fileOffset: 0x2000, name: "data" }
	]);
	const outputs = materializeImageSections(image, layout);
	const code = materializedSection(outputs, "code").bytes;
	const data = materializedSection(outputs, "data").bytes;
	assert.equal(new DataView(code.buffer).getInt32(3, true), 0x402008 - 0x401007);
	assert.equal(new DataView(data.buffer).getBigUint64(0, true), 0x401007n);
	assert.deepEqual([...image.sections[0].bytes], [0x48, 0x8d, 0x35, 0, 0, 0, 0, 0xc3]);
});

test("rejects malformed sections, entries, and relocations", () => {
	assert.throws(() => createExecutableImage({
		entry: { section: "code" },
		sections: [section("code", [0xc3]), section("code", [0])]
	}), /IMAGE_SECTION_NAME/);
	assert.throws(() => createExecutableImage({
		entry: { offset: 2, section: "code" },
		sections: [section("code", [0xc3])]
	}), /IMAGE_ENTRY_RANGE/);
	assert.throws(() => createExecutableImage({
		entry: { section: "code" },
		relocations: [{
			kind: "rip32",
			sourceOffset: 0,
			sourceSection: "code",
			targetSection: "missing"
		}],
		sections: [section("code", [0, 0, 0, 0])]
	}), /IMAGE_RELOCATION_SECTION/);
});

function section(name, bytes, alignment = 1, permissions = { read: true }) {
	return { alignment, bytes, name, permissions };
}
