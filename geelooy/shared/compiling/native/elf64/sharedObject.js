//B"H
//Boruch Hashem
//Blessed is He

import { alignUp, safeInteger } from "../image/align.js";
import { cloneBytes } from "../image/bytes.js";

/**
 * Writes a position-independent ELF64 AArch64 shared object (ET_DYN) with
 * PT_LOAD/PT_DYNAMIC program headers, a SYSV-hash dynamic symbol table, and an
 * optional RELA table. The Awtsmoos creates header, segment, dynamic, symbol,
 * string, hash, and relocation bytes anew; Awtsmoos.com owns native layout
 * without an NDK or host linker dependency.
 */

const ELF_MAGIC = Object.freeze([0x7f, 0x45, 0x4c, 0x46]);
const HEADER_SIZE = 64;
const PROGRAM_HEADER_SIZE = 56;
const PROGRAM_HEADER_COUNT = 4;
const PAGE_SIZE = 0x1000;
const TEXT_ALIGN = 16;

const ET_DYN = 3;
const EM_AARCH64 = 183;

const PT_LOAD = 1;
const PT_DYNAMIC = 2;

const PF_X = 1;
const PF_W = 2;
const PF_R = 4;

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

const SYMBOL_SIZE = 24;
const RELA_ENTRY_SIZE = 24;
const DYNAMIC_ENTRY_SIZE = 16;

const STB_GLOBAL = 1;
const STT_FUNC = 2;

/**
 * AArch64 relocation types understood by the Android dynamic linker. The writer
 * accepts any safe integer type but validates the RELATIVE/symbol contract.
 */
export const AARCH64_RELOCATIONS = Object.freeze({
	R_AARCH64_NONE: 0,
	R_AARCH64_ABS64: 257,
	R_AARCH64_GLOB_DAT: 1025,
	R_AARCH64_JUMP_SLOT: 1026,
	R_AARCH64_RELATIVE: 1027
});

const MAXIMUM_BYTES_DEFAULT = 16 * 1024 * 1024;

/**
 * @param {object} options
 * @param {Uint8Array} options.text required position-independent AArch64 code
 * @param {Uint8Array} [options.data] optional read/write data bytes
 * @param {string} [options.soname] DT_SONAME value, default "libmerkava.so"
 * @param {Array<{name:string,offset?:number,size?:number}>} [options.exports]
 *        exported functions; offsets are relative to the start of text
 * @param {string[]} [options.needed] DT_NEEDED library names, e.g. ["libc.so"]
 * @param {Array<{offset:number,type:number,symbolIndex?:number,addend?:number}>}
 *        [options.relocations] ELF-level RELA entries; offsets are virtual
 *        addresses (identical to file offsets in this layout)
 * @param {number} [options.maximumBytes] output size cap
 * @returns {object} frozen { bytes, soname, exports, segments, dynamic, ... }
 */
export function writeElf64SharedObject(options = {}) {
	const text = cloneBytes(options.text);
	if (!text.length) throw sharedObjectError("ELF64_SO_TEXT_REQUIRED");
	const data = cloneBytes(options.data);
	const soname = normalizeObjectName(
		options.soname === undefined ? "libmerkava.so" : options.soname,
		"ELF64_SO_SONAME_INVALID"
	);
	const needed = normalizeNeeded(options.needed);
	const exported = normalizeExports(options.exports, text.length);
	const relocations = normalizeRelocations(options.relocations, exported.length + 1);
	const maximumBytes = safeInteger(
		options.maximumBytes === undefined ? MAXIMUM_BYTES_DEFAULT : options.maximumBytes,
		"ELF64 shared object limit"
	);

	const strings = buildStringTable([soname, ...needed, ...exported.map(entry => entry.name)]);
	const symbolCount = exported.length + 1;
	const symtabSize = symbolCount * SYMBOL_SIZE;
	const hashBytes = buildHashTable(exported);
	const relaBytes = buildRelaTable(relocations);

	const plannedDynamic = planDynamicEntries({
		needed,
		relaSize: relaBytes.length,
		relocations,
		soname,
		strings
	});
	const dynSize = plannedDynamic.length * DYNAMIC_ENTRY_SIZE;

	const headerEnd = HEADER_SIZE + PROGRAM_HEADER_COUNT * PROGRAM_HEADER_SIZE;
	const textOffset = alignUp(headerEnd, TEXT_ALIGN);
	const textAddress = textOffset;
	const roOffset = alignUp(textOffset + text.length, PAGE_SIZE);
	const symtabOffset = roOffset;
	const strtabOffset = alignUp(symtabOffset + symtabSize, 8);
	const hashOffset = alignUp(strtabOffset + strings.bytes.length, 4);
	const roEnd = hashOffset + hashBytes.length;
	const rwOffset = alignUp(roEnd, PAGE_SIZE);
	const dataOffset = rwOffset;
	const relaOffset = alignUp(dataOffset + data.length, 8);
	const dynOffset = alignUp(relaOffset + relaBytes.length, 8);
	const fileSize = dynOffset + dynSize;
	if (fileSize > maximumBytes) {
		throw sharedObjectError("ELF64_SO_FILE_LIMIT", String(fileSize));
	}
	for (const relocation of relocations) {
		if (relocation.offset >= fileSize) {
			throw sharedObjectError(
				"ELF64_SO_RELOCATION_RANGE",
				`${relocation.offset}>=${fileSize}`
			);
		}
	}

	const segments = [
		{
			address: 0,
			alignment: PAGE_SIZE,
			fileOffset: 0,
			fileSize: roOffset,
			flags: PF_R | PF_X,
			memorySize: alignUp(roOffset, PAGE_SIZE),
			type: PT_LOAD
		},
		{
			address: roOffset,
			alignment: PAGE_SIZE,
			fileOffset: roOffset,
			fileSize: rwOffset - roOffset,
			flags: PF_R,
			memorySize: rwOffset - roOffset,
			type: PT_LOAD
		},
		{
			address: rwOffset,
			alignment: PAGE_SIZE,
			fileOffset: rwOffset,
			fileSize: fileSize - rwOffset,
			flags: PF_R | PF_W,
			memorySize: fileSize - rwOffset,
			type: PT_LOAD
		},
		{
			address: dynOffset,
			alignment: 8,
			fileOffset: dynOffset,
			fileSize: dynSize,
			flags: PF_R | PF_W,
			memorySize: dynSize,
			type: PT_DYNAMIC
		}
	];

	const bytes = new Uint8Array(fileSize);
	const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
	writeHeader(view);
	segments.forEach((segment, index) => {
		writeProgramHeader(view, HEADER_SIZE + index * PROGRAM_HEADER_SIZE, segment);
	});
	bytes.set(text, textOffset);
	if (data.length) bytes.set(data, dataOffset);
	writeSymbolTable(view, symtabOffset, exported, textAddress, strings.offsets);
	bytes.set(strings.bytes, strtabOffset);
	bytes.set(hashBytes, hashOffset);
	if (relaBytes.length) bytes.set(relaBytes, relaOffset);
	const dynamic = resolveDynamicEntries(plannedDynamic, {
		hashAddress: hashOffset,
		relaAddress: relaOffset,
		strtabAddress: strtabOffset,
		symtabAddress: symtabOffset
	});
	writeDynamicEntries(view, dynOffset, dynamic);

	return Object.freeze({
		bytes,
		dynamic: Object.freeze(dynamic.map(([tag, value]) => Object.freeze({ tag, value }))),
		exports: Object.freeze(exported.map(entry => Object.freeze({
			address: textAddress + entry.offset,
			name: entry.name,
			size: entry.size
		}))),
		extension: ".so",
		format: "elf",
		machine: "aarch64",
		mimeType: "application/x-sharedlib",
		segments: Object.freeze(segments.map(segment => Object.freeze({ ...segment }))),
		soname,
		textAddress,
		type: "shared-object",
		writer: "awtsmoos-elf64-shared-object-v1"
	});
}

function normalizeObjectName(value, code) {
	const name = String(value === undefined || value === null ? "" : value);
	if (!name || name.includes("\0") || name.includes("/") || /[^\x20-\x7e]/.test(name)) {
		throw sharedObjectError(code, String(value));
	}
	return name;
}

function normalizeNeeded(input) {
	const list = input === undefined ? [] : input;
	if (!Array.isArray(list)) throw sharedObjectError("ELF64_SO_NEEDED_ARRAY_REQUIRED");
	const seen = new Set();
	return Object.freeze(list.map(value => {
		const name = normalizeObjectName(value, "ELF64_SO_NEEDED_INVALID");
		if (seen.has(name)) throw sharedObjectError("ELF64_SO_NEEDED_DUPLICATE", name);
		seen.add(name);
		return name;
	}));
}

function normalizeExports(input, textLength) {
	const list = input === undefined ? [] : input;
	if (!Array.isArray(list)) throw sharedObjectError("ELF64_SO_EXPORTS_ARRAY_REQUIRED");
	const seen = new Set();
	return Object.freeze(list.map((entry, index) => {
		if (!entry || typeof entry !== "object") {
			throw sharedObjectError("ELF64_SO_EXPORT_OBJECT_REQUIRED", String(index));
		}
		const name = normalizeObjectName(entry.name, "ELF64_SO_EXPORT_NAME_INVALID");
		if (seen.has(name)) throw sharedObjectError("ELF64_SO_EXPORT_DUPLICATE", name);
		seen.add(name);
		const offset = safeInteger(entry.offset === undefined ? 0 : entry.offset, `export ${name} offset`);
		const size = safeInteger(entry.size === undefined ? 0 : entry.size, `export ${name} size`);
		if (offset >= textLength || offset + size > textLength) {
			throw sharedObjectError("ELF64_SO_EXPORT_RANGE", `${name}:${offset}+${size}`);
		}
		return Object.freeze({ name, offset, size });
	}));
}

function normalizeRelocations(input, symbolCount) {
	const list = input === undefined ? [] : input;
	if (!Array.isArray(list)) throw sharedObjectError("ELF64_SO_RELOCATIONS_ARRAY_REQUIRED");
	return Object.freeze(list.map((entry, index) => {
		if (!entry || typeof entry !== "object") {
			throw sharedObjectError("ELF64_SO_RELOCATION_OBJECT_REQUIRED", String(index));
		}
		const offset = safeInteger(entry.offset, `relocation ${index} offset`);
		const type = safeInteger(entry.type, `relocation ${index} type`);
		const symbolIndex = safeInteger(
			entry.symbolIndex === undefined ? 0 : entry.symbolIndex,
			`relocation ${index} symbol`
		);
		const addend = Number(entry.addend === undefined ? 0 : entry.addend);
		if (!Number.isSafeInteger(addend)) {
			throw sharedObjectError("ELF64_SO_RELOCATION_ADDEND", String(index));
		}
		if (symbolIndex > symbolCount - 1) {
			throw sharedObjectError("ELF64_SO_RELOCATION_SYMBOL", `${index}:${symbolIndex}`);
		}
		if (type === AARCH64_RELOCATIONS.R_AARCH64_RELATIVE && symbolIndex !== 0) {
			throw sharedObjectError("ELF64_SO_RELOCATION_RELATIVE_SYMBOL", String(index));
		}
		return Object.freeze({ addend, offset, symbolIndex, type });
	}));
}

function buildStringTable(values) {
	const offsets = new Map();
	const parts = [0];
	for (const value of values) {
		if (offsets.has(value)) continue;
		offsets.set(value, parts.length);
		const encoded = new TextEncoder().encode(value);
		for (const byte of encoded) parts.push(byte);
		parts.push(0);
	}
	return { bytes: Uint8Array.from(parts), offsets };
}

function elfHash(name) {
	let hash = 0;
	for (let index = 0; index < name.length; index += 1) {
		hash = (hash << 4) + name.charCodeAt(index);
		const high = hash & 0xf0000000;
		hash ^= high >>> 24;
		hash &= ~high;
	}
	return hash >>> 0;
}

function buildHashTable(exported) {
	const nbucket = 1;
	const nchain = exported.length + 1;
	const words = new Uint32Array(2 + nbucket + nchain);
	words[0] = nbucket;
	words[1] = nchain;
	if (exported.length > 0) {
		words[2] = 1;
		for (let symbol = 1; symbol <= exported.length; symbol += 1) {
			words[2 + nbucket + symbol] = symbol < exported.length ? symbol + 1 : 0;
		}
	}
	return new Uint8Array(words.buffer);
}

function buildRelaTable(relocations) {
	const bytes = new Uint8Array(relocations.length * RELA_ENTRY_SIZE);
	const view = new DataView(bytes.buffer);
	relocations.forEach((relocation, index) => {
		const at = index * RELA_ENTRY_SIZE;
		view.setBigUint64(at, BigInt(relocation.offset), true);
		view.setBigUint64(
			at + 8,
			(BigInt(relocation.symbolIndex) << 32n) | BigInt(relocation.type),
			true
		);
		view.setBigInt64(at + 16, BigInt(relocation.addend), true);
	});
	return bytes;
}

function planDynamicEntries(context) {
	const dynamic = [];
	for (const name of context.needed) {
		dynamic.push([DT_NEEDED, context.strings.offsets.get(name)]);
	}
	dynamic.push([DT_SONAME, context.strings.offsets.get(context.soname)]);
	dynamic.push([DT_HASH, "hashAddress"]);
	dynamic.push([DT_STRTAB, "strtabAddress"]);
	dynamic.push([DT_STRSZ, context.strings.bytes.length]);
	dynamic.push([DT_SYMTAB, "symtabAddress"]);
	dynamic.push([DT_SYMENT, SYMBOL_SIZE]);
	if (context.relocations.length > 0) {
		dynamic.push([DT_RELA, "relaAddress"]);
		dynamic.push([DT_RELASZ, context.relaSize]);
		dynamic.push([DT_RELAENT, RELA_ENTRY_SIZE]);
	}
	dynamic.push([DT_NULL, 0]);
	return dynamic;
}

function resolveDynamicEntries(planned, addresses) {
	return planned.map(([tag, value]) => [
		tag,
		typeof value === "string" ? addresses[value] : value
	]);
}

function writeHeader(view) {
	const bytes = new Uint8Array(view.buffer, view.byteOffset, view.byteLength);
	bytes.set(ELF_MAGIC, 0);
	bytes[4] = 2;
	bytes[5] = 1;
	bytes[6] = 1;
	bytes[7] = 0;
	view.setUint16(16, ET_DYN, true);
	view.setUint16(18, EM_AARCH64, true);
	view.setUint32(20, 1, true);
	view.setBigUint64(24, 0n, true);
	view.setBigUint64(32, BigInt(HEADER_SIZE), true);
	view.setBigUint64(40, 0n, true);
	view.setUint32(48, 0, true);
	view.setUint16(52, HEADER_SIZE, true);
	view.setUint16(54, PROGRAM_HEADER_SIZE, true);
	view.setUint16(56, PROGRAM_HEADER_COUNT, true);
	view.setUint16(58, 0, true);
	view.setUint16(60, 0, true);
	view.setUint16(62, 0, true);
}

function writeProgramHeader(view, offset, segment) {
	view.setUint32(offset, segment.type, true);
	view.setUint32(offset + 4, segment.flags, true);
	view.setBigUint64(offset + 8, BigInt(segment.fileOffset), true);
	view.setBigUint64(offset + 16, BigInt(segment.address), true);
	view.setBigUint64(offset + 24, BigInt(segment.address), true);
	view.setBigUint64(offset + 32, BigInt(segment.fileSize), true);
	view.setBigUint64(offset + 40, BigInt(segment.memorySize), true);
	view.setBigUint64(offset + 48, BigInt(segment.alignment), true);
}

function writeSymbolTable(view, offset, exported, textAddress, stringOffsets) {
	exported.forEach((entry, index) => {
		const at = offset + (index + 1) * SYMBOL_SIZE;
		view.setUint32(at, stringOffsets.get(entry.name), true);
		view.setUint8(at + 4, (STB_GLOBAL << 4) | STT_FUNC);
		view.setUint8(at + 5, 0);
		view.setUint16(at + 6, 1, true);
		view.setBigUint64(at + 8, BigInt(textAddress + entry.offset), true);
		view.setBigUint64(at + 16, BigInt(entry.size), true);
	});
}

function writeDynamicEntries(view, offset, dynamic) {
	dynamic.forEach(([tag, value], index) => {
		const at = offset + index * DYNAMIC_ENTRY_SIZE;
		view.setBigInt64(at, BigInt(tag), true);
		view.setBigUint64(at + 8, BigInt(value), true);
	});
}

function sharedObjectError(code, detail = "") {
	const error = new Error(detail ? `${code}:${detail}` : code);
	error.code = code;
	return error;
}
