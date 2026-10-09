//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import {
	AARCH64_RELOCATIONS,
	writeElf64SharedObject
} from "../sharedObject.js";

// mov w0, #0 ; ret  — minimal ANativeActivity_onCreate that just returns.
const ON_CREATE_TEXT = Uint8Array.from([
	0x00, 0x00, 0x80, 0x52,
	0xc0, 0x03, 0x5f, 0xd6
]);

const DT_NULL = 0;
const DT_NEEDED = 1;
const DT_HASH = 4;
const DT_STRTAB = 5;
const DT_SYMTAB = 6;
const DT_RELA = 7;
const DT_RELASZ = 8;
const DT_RELAENT = 9;
const DT_STRSZ = 10;
const DT_SYMENT = 11;
const DT_SONAME = 14;

function buildMinimal(overrides = {}) {
	return writeElf64SharedObject({
		exports: [{ name: "ANativeActivity_onCreate", offset: 0, size: 8 }],
		soname: "libmerkava.so",
		text: ON_CREATE_TEXT,
		...overrides
	});
}

function viewOf(bytes) {
	return new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
}

function readDynamic(bytes) {
	const view = viewOf(bytes);
	const phoff = Number(view.getBigUint64(32, true));
	const phnum = view.getUint16(56, true);
	let dynamicOffset = -1;
	for (let index = 0; index < phnum; index += 1) {
		const at = phoff + index * 56;
		if (view.getUint32(at, true) === 2) {
			dynamicOffset = Number(view.getBigUint64(at + 8, true));
		}
	}
	assert.notEqual(dynamicOffset, -1, "PT_DYNAMIC present");
	const entries = [];
	let at = dynamicOffset;
	for (;;) {
		const tag = Number(view.getBigInt64(at, true));
		const value = Number(view.getBigUint64(at + 8, true));
		entries.push({ tag, value });
		if (tag === DT_NULL) break;
		at += 16;
		if (entries.length > 64) throw new Error("DYNAMIC_RUNAWAY");
	}
	return entries;
}

function readCString(bytes, offset) {
	let end = offset;
	while (bytes[end] !== 0) end += 1;
	return new TextDecoder().decode(bytes.slice(offset, end));
}

function elfHash(name) {
	let hash = 0;
	for (const char of name) {
		hash = (hash << 4) + char.charCodeAt(0);
		const high = hash & 0xf0000000;
		hash ^= high >>> 24;
		hash &= ~high;
	}
	return hash >>> 0;
}

// Walks the SYSV hash table exactly the way the Android dynamic linker does.
function lookupSymbol(bytes, dynamic, name) {
	const view = viewOf(bytes);
	const tag = Object.fromEntries(dynamic.map(entry => [entry.tag, entry.value]));
	const symtab = tag[DT_SYMTAB];
	const strtab = tag[DT_STRTAB];
	const hash = tag[DT_HASH];
	const nbucket = view.getUint32(hash, true);
	const nchain = view.getUint32(hash + 4, true);
	const wanted = elfHash(name) % nbucket;
	let symbol = view.getUint32(hash + 8 + wanted * 4, true);
	while (symbol !== 0) {
		const at = symtab + symbol * 24;
		const nameOffset = view.getUint32(at, true);
		if (readCString(bytes, strtab + nameOffset) === name) {
			return {
				index: symbol,
				info: view.getUint8(at + 4),
				other: view.getUint8(at + 5),
				shndx: view.getUint16(at + 6, true),
				value: Number(view.getBigUint64(at + 8, true)),
				size: Number(view.getBigUint64(at + 16, true))
			};
		}
		symbol = view.getUint32(hash + 8 + nbucket * 4 + symbol * 4, true);
		if (symbol >= nchain) throw new Error("HASH_CHAIN_RUNAWAY");
	}
	return null;
}

test("writes an ET_DYN AArch64 ELF header", () => {
	const { bytes } = buildMinimal();
	assert.deepEqual([...bytes.slice(0, 4)], [0x7f, 0x45, 0x4c, 0x46]);
	const view = viewOf(bytes);
	assert.equal(bytes[4], 2);
	assert.equal(bytes[5], 1);
	assert.equal(view.getUint16(16, true), 3);
	assert.equal(view.getUint16(18, true), 183);
	assert.equal(view.getUint16(56, true), 4);
});

test("emits PT_LOAD RX/R/RW plus PT_DYNAMIC segments", () => {
	const { bytes, segments } = buildMinimal();
	assert.equal(segments.length, 4);
	assert.deepEqual(segments.map(segment => segment.type), [1, 1, 1, 2]);
	assert.deepEqual(segments.map(segment => segment.flags), [5, 4, 6, 6]);
	for (const segment of segments) {
		assert.equal(segment.address, segment.fileOffset);
	}
	const view = viewOf(bytes);
	const phoff = Number(view.getBigUint64(32, true));
	assert.equal(view.getUint32(phoff + 3 * 56, true), 2);
});

test("dynamic section carries soname, symtab, strtab, and hash", () => {
	const { bytes } = buildMinimal();
	const dynamic = readDynamic(bytes);
	const tag = Object.fromEntries(dynamic.map(entry => [entry.tag, entry.value]));
	for (const required of [DT_SONAME, DT_SYMTAB, DT_SYMENT, DT_STRTAB, DT_STRSZ, DT_HASH, DT_NULL]) {
		assert.ok(tag[required] !== undefined, `DT tag ${required} present`);
	}
	assert.equal(tag[DT_SYMENT], 24);
	assert.equal(readCString(bytes, tag[DT_STRTAB] + tag[DT_SONAME]), "libmerkava.so");
	assert.ok(dynamic[dynamic.length - 1].tag === DT_NULL);
});

test("exports ANativeActivity_onCreate as a global function via the hash table", () => {
	const { bytes, textAddress } = buildMinimal();
	const dynamic = readDynamic(bytes);
	const symbol = lookupSymbol(bytes, dynamic, "ANativeActivity_onCreate");
	assert.ok(symbol, "symbol resolvable through DT_HASH");
	assert.equal(symbol.info, 0x12);
	assert.notEqual(symbol.shndx, 0);
	assert.equal(symbol.value, textAddress);
	assert.equal(symbol.size, 8);
	assert.deepEqual(
		[...bytes.slice(symbol.value, symbol.value + 8)],
		[...ON_CREATE_TEXT]
	);
});

test("emits DT_NEEDED entries when libraries are requested", () => {
	const { bytes } = buildMinimal({ needed: ["libc.so", "libandroid.so"] });
	const dynamic = readDynamic(bytes);
	const tag = Object.fromEntries(dynamic.map(entry => [entry.tag, entry.value]));
	const strtab = tag[DT_STRTAB];
	const neededValues = dynamic
		.filter(entry => entry.tag === DT_NEEDED)
		.map(entry => readCString(bytes, strtab + entry.value))
		.sort();
	assert.deepEqual(neededValues, ["libandroid.so", "libc.so"]);
});

test("emits a RELA table with DT_RELA/DT_RELASZ/DT_RELAENT for PIC relocations", () => {
	const { bytes } = buildMinimal({
		data: Uint8Array.from([0x11, 0x22, 0x33, 0x44, 0x55, 0x66, 0x77, 0x88]),
		relocations: [{
			addend: 0,
			offset: 0x2000,
			symbolIndex: 0,
			type: AARCH64_RELOCATIONS.R_AARCH64_RELATIVE
		}]
	});
	const dynamic = readDynamic(bytes);
	const tag = Object.fromEntries(dynamic.map(entry => [entry.tag, entry.value]));
	assert.ok(tag[DT_RELA] !== undefined);
	assert.equal(tag[DT_RELASZ], 24);
	assert.equal(tag[DT_RELAENT], 24);
	const view = viewOf(bytes);
	const rela = tag[DT_RELA];
	assert.equal(Number(view.getBigUint64(rela, true)), 0x2000);
	const info = view.getBigUint64(rela + 8, true);
	assert.equal(Number(info & 0xffffffffn), AARCH64_RELOCATIONS.R_AARCH64_RELATIVE);
	assert.equal(Number(info >> 32n), 0);
	assert.equal(Number(view.getBigInt64(rela + 16, true)), 0);
});

test("omits the RELA table when there are no relocations", () => {
	const { bytes } = buildMinimal();
	const dynamic = readDynamic(bytes);
	const tags = dynamic.map(entry => entry.tag);
	assert.ok(!tags.includes(DT_RELA));
	assert.ok(!tags.includes(DT_RELASZ));
	assert.ok(!tags.includes(DT_RELAENT));
});

test("builds byte-identical output for identical input", () => {
	const first = buildMinimal({ needed: ["libc.so"] });
	const second = buildMinimal({ needed: ["libc.so"] });
	assert.deepEqual(first.bytes, second.bytes);
});

test("rejects empty text, out-of-range exports, and duplicate names", () => {
	assert.throws(() => writeElf64SharedObject({ text: new Uint8Array(0) }), /ELF64_SO_TEXT_REQUIRED/);
	assert.throws(
		() => buildMinimal({ exports: [{ name: "f", offset: 99, size: 1 }] }),
		/ELF64_SO_EXPORT_RANGE/
	);
	assert.throws(
		() => buildMinimal({ exports: [{ name: "f", offset: 0 }, { name: "f", offset: 0 }] }),
		/ELF64_SO_EXPORT_DUPLICATE/
	);
	assert.throws(
		() => buildMinimal({
			relocations: [{ offset: 0, type: AARCH64_RELOCATIONS.R_AARCH64_RELATIVE, symbolIndex: 1 }]
		}),
		/ELF64_SO_RELOCATION_RELATIVE_SYMBOL/
	);
});
