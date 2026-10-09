//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import {
	createArm64Object,
	linkArm64Objects,
	linkArm64ObjectsToSharedObject,
	predictSharedObjectLayout
} from "../arm64Linker.js";
import { writeElf64SharedObject } from "../sharedObject.js";
import * as E from "../../../../../../scripts/awtsmoos/compiling/native/arm64/encoder.js";

function wordsToBytes(words) {
	const bytes = new Uint8Array(words.length * 4);
	const view = new DataView(bytes.buffer);
	words.forEach((word, index) => view.setUint32(index * 4, word >>> 0, true));
	return bytes;
}

function makeObject(overrides = {}) {
	return createArm64Object({
		architecture: "aarch64",
		name: "test-object",
		relocations: [],
		sections: [
			{
				alignment: 4,
				bytes: wordsToBytes([E.ret()]),
				name: "code",
				permissions: { execute: true, read: true }
			}
		],
		symbols: [
			{ binding: "global", kind: "function", name: "entry", offset: 0, section: "code" }
		],
		version: "awtsmoos-object-v1",
		...overrides
	});
}

function viewOf(bytes) {
	return new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
}

function decodeBranchTarget(word, pc) {
	const imm = word & 0x3FFFFFF;
	const offset = imm >= 0x2000000 ? imm - 0x4000000 : imm;
	return pc + offset * 4;
}

function decodeAdrTarget(word, pc) {
	const immlo = (word >>> 29) & 0x3;
	const immhi = (word >>> 5) & 0x7FFFF;
	let offset = (immhi << 2) | immlo;
	if (offset >= 0x100000) offset -= 0x200000;
	return pc + offset;
}

test("rejects malformed objects", () => {
	assert.throws(() => createArm64Object({}), /ARM64_OBJECT_VERSION/);
	assert.throws(() => makeObject({ architecture: "x86_64" }), /ARM64_OBJECT_ARCHITECTURE/);
	assert.throws(() => makeObject({ sections: [] }), /ARM64_OBJECT_SECTION_COUNT/);
	assert.throws(() => makeObject({
		sections: [{ name: "bogus", bytes: new Uint8Array(4), permissions: {} }]
	}), /ARM64_OBJECT_SECTION_NAME/);
	assert.throws(() => makeObject({
		relocations: [{ kind: "arm64_bogus", sourceOffset: 0, sourceSection: "code", targetSymbol: "x" }],
		symbols: []
	}), /ARM64_OBJECT_RELOCATION_KIND/);
});

test("links cross-object BL and ADR with correct re-encoding", () => {
	const caller = makeObject({
		name: "caller-obj",
		sections: [{
			alignment: 4,
			bytes: wordsToBytes([E.bl(0), E.adr(1, 0), E.ret()]),
			name: "code",
			permissions: { execute: true, read: true }
		}],
		symbols: [{ binding: "global", kind: "function", name: "caller", offset: 0, section: "code" }],
		relocations: [
			{ addend: 0, kind: "arm64_bl", sourceOffset: 0, sourceSection: "code", targetSymbol: "helper" },
			{ addend: 0, kind: "arm64_adr", sourceOffset: 4, sourceSection: "code", targetSymbol: "config" }
		]
	});
	const callee = makeObject({
		name: "callee-obj",
		sections: [
			{
				alignment: 4,
				bytes: wordsToBytes([E.movz(0, 7, 0, 64), E.ret()]),
				name: "code",
				permissions: { execute: true, read: true }
			},
			{
				alignment: 8,
				bytes: new Uint8Array([9, 9, 9, 9, 9, 9, 9, 9]),
				name: "data",
				permissions: { read: true, write: true }
			}
		],
		symbols: [
			{ binding: "global", kind: "function", name: "helper", offset: 0, section: "code" },
			{ binding: "global", kind: "data", name: "config", offset: 0, section: "data" }
		]
	});
	const linked = linkArm64Objects([caller, callee], { exports: ["caller"] });
	const view = viewOf(linked.text);
	const textBase = linked.layout.textAddress;
	const dataBase = linked.layout.dataAddress;

	const blTarget = decodeBranchTarget(view.getUint32(0, true), textBase);
	assert.equal(blTarget, textBase + 12, "BL reaches helper in second object");

	const adrTarget = decodeAdrTarget(view.getUint32(4, true), textBase + 4);
	assert.equal(adrTarget, dataBase, "ADR reaches config in .data");

	assert.equal(linked.evidence.staticRelocations, 2);
	assert.equal(linked.evidence.pltStubs, 0);
	assert.deepEqual(linked.exports.map(e => e.name), ["caller"]);
});

test("rejects duplicate global symbols", () => {
	const first = makeObject({ name: "first" });
	const second = makeObject({ name: "second" });
	assert.throws(() => linkArm64Objects([first, second]), /ARM64_LINK_SYMBOL_DUPLICATE/);
});

test("synthesizes PLT stub and GOT slot for undefined functions", () => {
	const caller = makeObject({
		name: "caller-obj",
		sections: [{
			alignment: 4,
			bytes: wordsToBytes([E.bl(0), E.ret()]),
			name: "code",
			permissions: { execute: true, read: true }
		}],
		symbols: [{ binding: "global", kind: "function", name: "caller", offset: 0, section: "code" }],
		relocations: [
			{ addend: 0, kind: "arm64_bl", sourceOffset: 0, sourceSection: "code", targetSymbol: "eglGetDisplay" }
		]
	});
	const linked = linkArm64Objects([caller], {
		needed: ["libEGL.so"],
		soname: "libplt.so"
	});
	assert.equal(linked.evidence.pltStubs, 1);
	assert.equal(linked.evidence.pltRelocations, 1);
	assert.deepEqual(linked.undefinedSymbols, [{ kind: "function", name: "eglGetDisplay" }]);

	const view = viewOf(linked.text);
	const textBase = linked.layout.textAddress;
	const dataBase = linked.layout.dataAddress;

	// BL now targets the PLT stub right after .code
	const stubVaddr = decodeBranchTarget(view.getUint32(0, true), textBase);
	assert.equal(stubVaddr, textBase + 8, "BL redirected to PLT stub");

	// PLT stub: ADRP x16, <got page> ; LDR x16,[x16,<lo12>] ; BR x16
	const stubOff = 8;
	const adrp = view.getUint32(stubOff, true);
	assert.equal(adrp & 0x1F, 16, "ADRP targets x16");
	assert.equal((adrp >>> 31) & 1, 1, "ADRP (not ADR)");
	const ldr = view.getUint32(stubOff + 4, true);
	assert.equal((ldr >>> 30) & 0b11, 0b11, "64-bit LDR");
	assert.equal(ldr & 0x1F, 16, "LDR targets x16");
	assert.equal((ldr >>> 5) & 0x1F, 16, "LDR base x16");
	const br = view.getUint32(stubOff + 8, true);
	assert.equal(br >>> 21, 0b11010110000, "BR encoding");
	assert.equal((br >>> 5) & 0x1F, 16, "BR x16");

	// GOT slot address decoded from the stub must equal the JUMP_SLOT rela offset
	const pageOff = (() => {
		const immlo = (adrp >>> 29) & 0x3;
		const immhi = (adrp >>> 5) & 0x7FFFF;
		let off = (immhi << 2) | immlo;
		if (off >= 0x100000) off -= 0x200000;
		return off;
	})();
	const gotVaddr = (Math.trunc(stubVaddr / 4096) + pageOff) * 4096 + ((ldr >>> 10) & 0xFFF) * 8;
	assert.equal(gotVaddr, dataBase + 0, "stub loads GOT slot 0");

	const jumpSlot = linked.rela.find(r => r.type === 1026);
	assert.ok(jumpSlot, "R_AARCH64_JUMP_SLOT emitted");
	assert.equal(jumpSlot.offset, gotVaddr);
	assert.equal(jumpSlot.symbolIndex, 2, "undefined symbol follows null + 1 export");
});

test("emits GLOB_DAT for undefined data via abs64", () => {
	const obj = makeObject({
		name: "data-user",
		sections: [
			{
				alignment: 4,
				bytes: wordsToBytes([E.ret()]),
				name: "code",
				permissions: { execute: true, read: true }
			},
			{
				alignment: 8,
				bytes: new Uint8Array(8),
				name: "data",
				permissions: { read: true, write: true }
			}
		],
		symbols: [{ binding: "global", kind: "function", name: "entry", offset: 0, section: "code" }],
		relocations: [
			{ addend: 0, kind: "arm64_abs64", sourceOffset: 0, sourceSection: "data", targetSymbol: "environ" }
		]
	});
	const linked = linkArm64Objects([obj], {});
	const globDat = linked.rela.find(r => r.type === 1025);
	assert.ok(globDat, "R_AARCH64_GLOB_DAT emitted");
	assert.equal(globDat.offset, linked.layout.dataAddress);
	assert.deepEqual(
		linked.undefinedSymbols.find(s => s.name === "environ"),
		{ kind: "data", name: "environ" }
	);
});

test("layout prediction agrees with the real writer", () => {
	const obj = makeObject({ name: "layout-obj" });
	const linked = linkArm64Objects([obj], {
		needed: ["libc.so", "libdl.so"],
		soname: "libagree.so"
	});
	const written = writeElf64SharedObject({
		data: linked.data,
		exports: linked.exports,
		needed: linked.needed,
		relocations: linked.rela,
		soname: linked.soname,
		text: linked.text,
		undefinedSymbols: linked.undefinedSymbols
	});
	assert.equal(written.textAddress, linked.layout.textAddress, "text vaddr agrees");
	const rwSegment = written.segments.find(s => s.type === 1 && s.flags === 6);
	assert.equal(rwSegment.address, linked.layout.dataAddress, "data vaddr agrees");
	assert.equal(written.bytes.length > 0, true);
});

test("produces a structurally valid ET_DYN AArch64 .so", () => {
	const obj = makeObject({ name: "so-obj" });
	const so = linkArm64ObjectsToSharedObject([obj], {
		needed: ["libc.so"],
		soname: "libstruct.so"
	});
	const view = viewOf(so.bytes);
	assert.deepEqual(
		[view.getUint8(0), view.getUint8(1), view.getUint8(2), view.getUint8(3)],
		[0x7F, 0x45, 0x4C, 0x46],
		"ELF magic"
	);
	assert.equal(view.getUint16(16, true), 3, "ET_DYN");
	assert.equal(view.getUint16(18, true), 183, "EM_AARCH64");

	// Find DT_SONAME string via PT_DYNAMIC -> DT_STRTAB
	const phoff = Number(view.getBigUint64(32, true));
	const phnum = view.getUint16(56, true);
	let dynOff = -1;
	for (let i = 0; i < phnum; i++) {
		if (view.getUint32(phoff + i * 56, true) === 2) dynOff = Number(view.getBigUint64(phoff + i * 56 + 8, true));
	}
	assert.notEqual(dynOff, -1, "PT_DYNAMIC present");
	let strtab = -1;
	let sonameOff = -1;
	for (let at = dynOff; ; at += 16) {
		const tag = Number(view.getBigInt64(at, true));
		const val = Number(view.getBigUint64(at + 8, true));
		if (tag === 0) break;
		if (tag === 5) strtab = val;
		if (tag === 14) sonameOff = val;
	}
	assert.notEqual(strtab, -1, "DT_STRTAB present");
	let name = "";
	for (let i = strtab + sonameOff; so.bytes[i] !== 0; i++) name += String.fromCharCode(so.bytes[i]);
	assert.equal(name, "libstruct.so", "DT_SONAME correct");
	assert.equal(so.linker.version, "awtsmoos-arm64-link-v1");
});
