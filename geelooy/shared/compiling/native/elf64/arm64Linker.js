//B"H
//Boruch Hashem
//Blessed is He

import { alignUp, safeInteger } from "../image/align.js";
import { cloneBytes } from "../image/bytes.js";
import {
	AARCH64_RELOCATIONS,
	writeElf64SharedObject
} from "./sharedObject.js";

/**
 * Static linker: AArch64 Awtsmoos objects -> position-independent ELF64
 * shared object (ET_DYN), loadable by the Android dynamic linker.
 *
 * The Awtsmoos creates section merging, symbol resolution, AArch64
 * instruction re-encoding, PLT/GOT synthesis, and layout prediction anew;
 * Awtsmoos.com owns native linking without an NDK or host linker dependency.
 *
 * Input object contract ("awtsmoos-object-v1", architecture "aarch64"):
 * {
 *   version: "awtsmoos-object-v1",
 *   architecture: "aarch64",
 *   name: "merkava_android_main",
 *   sections: [
 *     { name: "code", bytes: Uint8Array, alignment: 4,
 *       permissions: { execute: true, read: true } },
 *     { name: "data", bytes: Uint8Array, alignment: 8,
 *       permissions: { read: true, write: true } }
 *   ],
 *   symbols: [
 *     { name: "ANativeActivity_onCreate", offset: 0, section: "code",
 *       binding: "global", kind: "function" }
 *   ],
 *   relocations: [
 *     { kind: "arm64_bl", sourceOffset: 12, sourceSection: "code",
 *       targetSymbol: "helper", addend: 0 }
 *   ]
 * }
 *
 * Relocation kinds:
 *   arm64_b, arm64_bl      PC-relative branch (target: defined code symbol)
 *   arm64_cbz, arm64_cbnz  compare-and-branch (target: defined code symbol)
 *   arm64_bcond            conditional branch (target: defined code symbol)
 *   arm64_adr              PC-relative address, +-1MB (target: defined symbol)
 *   arm64_adrp             page-relative address (target: defined symbol)
 *   arm64_lo12             ADD/SUB :lo12: of target (pairs with arm64_adrp)
 *   arm64_ldr_literal      PC-relative literal load (target: defined symbol)
 *   arm64_abs64            64-bit absolute slot in data. Defined target: link-time
 *                          address. Undefined target: R_AARCH64_GLOB_DAT.
 * A BL to an undefined function symbol synthesizes a PLT stub plus a GOT slot
 * with R_AARCH64_JUMP_SLOT; the Android loader fills GOT slots at load time
 * (Android resolves JUMP_SLOT eagerly, so the minimal 3-instruction PLT needs
 * no lazy resolver).
 */

const OBJECT_VERSION = "awtsmoos-object-v1";
const ARCHITECTURE = "aarch64";

const CODE_RELOCATION_KINDS = new Set([
	"arm64_b",
	"arm64_bl",
	"arm64_cbz",
	"arm64_cbnz",
	"arm64_bcond",
	"arm64_adr",
	"arm64_adrp",
	"arm64_lo12",
	"arm64_ldr_literal"
]);
const DATA_RELOCATION_KINDS = new Set(["arm64_abs64"]);

const SYMBOL_NAME_PATTERN = /^[A-Za-z_.$][A-Za-z0-9_.$-]*$/;

// Writer layout constants (must mirror sharedObject.js exactly; the
// layout-agreement test guards against drift).
const ELF_HEADER_SIZE = 64;
const PROGRAM_HEADER_SIZE = 56;
const PROGRAM_HEADER_COUNT = 4;
const PAGE_SIZE = 0x1000;
const TEXT_ALIGN = 16;
const SYMBOL_SIZE = 24;

const PLT_STUB_SIZE = 12;
const GOT_SLOT_SIZE = 8;
const PLT_SCRATCH_REGISTER = 16;

/**
 * Validates and freezes one AArch64 object. The Awtsmoos creates the immutable
 * object anew; Awtsmoos.com rejects malformed vessels before linking.
 */
export function createArm64Object(options = {}) {
	if (options?.version !== OBJECT_VERSION) {
		throw linkerError("ARM64_OBJECT_VERSION", String(options?.version));
	}
	if (options?.architecture !== ARCHITECTURE) {
		throw linkerError("ARM64_OBJECT_ARCHITECTURE", String(options?.architecture));
	}
	const name = String(options.name || "anonymous-arm64-object");
	const sections = normalizeSections(options.sections);
	const sectionMap = new Map(sections.map(section => [section.name, section]));
	const symbols = normalizeSymbols(options.symbols, sectionMap);
	const symbolNames = new Set(symbols.map(symbol => symbol.name));
	const relocations = normalizeRelocations(options.relocations, sectionMap, symbolNames);
	return Object.freeze({
		architecture: ARCHITECTURE,
		name,
		relocations,
		sections,
		symbols,
		version: OBJECT_VERSION
	});
}

function normalizeSections(input) {
	if (!Array.isArray(input) || input.length < 1 || input.length > 16) {
		throw linkerError("ARM64_OBJECT_SECTION_COUNT", String(input?.length ?? -1));
	}
	const names = new Set();
	return Object.freeze(input.map((section, index) => {
		const sectionName = String(section?.name || `section_${index}`);
		if ((sectionName !== "code" && sectionName !== "data") || names.has(sectionName)) {
			throw linkerError("ARM64_OBJECT_SECTION_NAME", sectionName);
		}
		names.add(sectionName);
		const bytes = cloneBytes(section.bytes);
		const alignment = safeInteger(section.alignment ?? 1, `${sectionName} alignment`);
		alignUp(0, alignment);
		const permissions = section.permissions || {};
		if (sectionName === "code" && !(permissions.execute && permissions.read)) {
			throw linkerError("ARM64_OBJECT_CODE_PERMISSIONS", sectionName);
		}
		if (sectionName === "data" && !(permissions.read && permissions.write)) {
			throw linkerError("ARM64_OBJECT_DATA_PERMISSIONS", sectionName);
		}
		return Object.freeze({
			alignment,
			bytes,
			name: sectionName,
			permissions: Object.freeze({
				execute: Boolean(permissions.execute),
				read: permissions.read !== false,
				write: Boolean(permissions.write)
			})
		});
	}));
}

function normalizeSymbols(input, sectionMap) {
	const list = input === undefined ? [] : input;
	if (!Array.isArray(list)) throw linkerError("ARM64_OBJECT_SYMBOLS_ARRAY");
	const names = new Set();
	return Object.freeze(list.map(symbol => {
		const name = String(symbol?.name || "");
		if (!SYMBOL_NAME_PATTERN.test(name) || names.has(name)) {
			throw linkerError("ARM64_OBJECT_SYMBOL_NAME", name);
		}
		names.add(name);
		const section = sectionMap.get(String(symbol.section || ""));
		if (!section) throw linkerError("ARM64_OBJECT_SYMBOL_SECTION", name);
		const offset = safeInteger(symbol.offset ?? 0, `${name} offset`);
		if (offset >= Math.max(1, section.bytes.length)) {
			throw linkerError("ARM64_OBJECT_SYMBOL_RANGE", name);
		}
		const binding = symbol.binding === "local" ? "local" : "global";
		const kind = symbol.kind === "data" ? "data" : "function";
		return Object.freeze({ binding, kind, name, offset, section: section.name });
	}));
}

function normalizeRelocations(input, sectionMap, symbolNames) {
	const list = input === undefined ? [] : input;
	if (!Array.isArray(list)) throw linkerError("ARM64_OBJECT_RELOCATIONS_ARRAY");
	return Object.freeze(list.map((relocation, index) => {
		const kind = String(relocation?.kind || "");
		const sourceSection = String(relocation?.sourceSection || "");
		const validKind =
			(sourceSection === "code" && CODE_RELOCATION_KINDS.has(kind)) ||
			(sourceSection === "data" && DATA_RELOCATION_KINDS.has(kind));
		if (!validKind) {
			throw linkerError("ARM64_OBJECT_RELOCATION_KIND", `${index}:${kind}:${sourceSection}`);
		}
		const section = sectionMap.get(sourceSection);
		if (!section) throw linkerError("ARM64_OBJECT_RELOCATION_SECTION", `${index}:${sourceSection}`);
		const sourceOffset = safeInteger(relocation.sourceOffset, `relocation ${index} source`);
		const width = sourceSection === "code" ? 4 : 8;
		if (sourceOffset + width > section.bytes.length || (sourceSection === "code" && sourceOffset % 4 !== 0)) {
			throw linkerError("ARM64_OBJECT_RELOCATION_RANGE", `${index}:${sourceOffset}`);
		}
		const targetSymbol = String(relocation.targetSymbol || "");
		if (!targetSymbol) throw linkerError("ARM64_OBJECT_RELOCATION_TARGET", String(index));
		const addend = Number(relocation.addend || 0);
		if (!Number.isSafeInteger(addend)) {
			throw linkerError("ARM64_OBJECT_RELOCATION_ADDEND", String(index));
		}
		return Object.freeze({
			addend,
			external: !symbolNames.has(targetSymbol),
			kind,
			sourceOffset,
			sourceSection,
			targetSymbol
		});
	}));
}

/**
 * Replicates the deterministic layout of writeElf64SharedObject so the linker
 * can resolve PC-relative AArch64 encodings against final virtual addresses.
 * vaddr == file offset in the writer's layout. The layout-agreement test
 * verifies this prediction against real writer output.
 */
export function predictSharedObjectLayout(options = {}) {
	const textLength = safeInteger(options.textLength, "text length");
	const dataLength = safeInteger(options.dataLength ?? 0, "data length");
	const soname = String(options.soname ?? "libmerkava.so");
	const needed = options.needed ?? [];
	const definedNames = options.definedNames ?? [];
	const undefinedNames = options.undefinedNames ?? [];

	const headerEnd = ELF_HEADER_SIZE + PROGRAM_HEADER_COUNT * PROGRAM_HEADER_SIZE;
	const textOffset = alignUp(headerEnd, TEXT_ALIGN);
	const textAddress = textOffset;
	const roOffset = alignUp(textOffset + Math.max(textLength, 1), PAGE_SIZE);

	const stringSet = new Set();
	const stringBytes = [0];
	for (const value of [soname, ...needed, ...definedNames, ...undefinedNames]) {
		if (stringSet.has(value)) continue;
		stringSet.add(value);
		const encoded = new TextEncoder().encode(value);
		for (const byte of encoded) stringBytes.push(byte);
		stringBytes.push(0);
	}
	const symbolCount = 1 + definedNames.length + undefinedNames.length;
	const symtabSize = symbolCount * SYMBOL_SIZE;
	const symtabOffset = roOffset;
	const strtabOffset = alignUp(symtabOffset + symtabSize, 8);
	const hashOffset = alignUp(strtabOffset + stringBytes.length, 4);
	const hashLength = 4 * (2 + 1 + symbolCount);
	const roEnd = hashOffset + hashLength;
	const rwOffset = alignUp(roEnd, PAGE_SIZE);
	const dataAddress = rwOffset;

	return Object.freeze({
		dataAddress,
		dataLength,
		hashLength,
		hashOffset,
		roOffset,
		rwOffset,
		strtabLength: stringBytes.length,
		strtabOffset,
		symbolCount,
		symtabOffset,
		symtabSize,
		textAddress,
		textLength
	});
}

/**
 * Links AArch64 objects into one position-independent image and emits a valid
 * ELF64 shared object. Returns the writer result plus linker evidence.
 */
export function linkArm64ObjectsToSharedObject(objects, options = {}) {
	const linked = linkArm64Objects(objects, options);
	const written = writeElf64SharedObject({
		data: linked.data,
		exports: linked.exports,
		needed: linked.needed,
		relocations: linked.rela,
		soname: linked.soname,
		text: linked.text,
		undefinedSymbols: linked.undefinedSymbols
	});
	return Object.freeze({ ...written, linker: linked.evidence });
}

/**
 * Static link only: merges sections, resolves symbols, re-encodes AArch64
 * instructions, synthesizes PLT/GOT, and predicts final virtual addresses.
 */
export function linkArm64Objects(objects, options = {}) {
	const normalized = normalizeObjects(objects);
	const merged = mergeSections(normalized);
	const defined = resolveDefinedSymbols(normalized, merged);
	const undefinedFunctions = collectUndefinedFunctions(normalized, defined);
	const undefinedData = collectUndefinedData(normalized, defined);

	const soname = String(options.soname ?? "libmerkava.so");
	const needed = Object.freeze([...new Set(options.needed ?? [])]);

	const codeLength = merged.code.bytes.length;
	const dataLength = merged.data.bytes.length;
	const pltLength = undefinedFunctions.length * PLT_STUB_SIZE;
	const gotLength = undefinedFunctions.length * GOT_SLOT_SIZE;
	const textLength = codeLength + pltLength;
	const totalDataLength = dataLength + gotLength;

	const exportNames = resolveExportNames(options.exports, defined);
	const layout = predictSharedObjectLayout({
		dataLength: totalDataLength,
		definedNames: exportNames,
		needed,
		soname,
		textLength,
		undefinedNames: [...undefinedFunctions, ...undefinedData]
	});

	const codeBase = layout.textAddress;
	const dataBase = layout.dataAddress;
	const symbolAddresses = new Map();
	for (const [name, symbol] of defined) {
		const base = symbol.section === "code" ? codeBase : dataBase;
		symbolAddresses.set(name, base + symbol.mergedOffset);
	}
	const pltBase = codeBase + codeLength;
	const gotBase = dataBase + dataLength;
	const pltAddresses = new Map();
	const gotAddresses = new Map();
	undefinedFunctions.forEach((name, index) => {
		pltAddresses.set(name, pltBase + index * PLT_STUB_SIZE);
		gotAddresses.set(name, gotBase + index * GOT_SLOT_SIZE);
	});

	const text = new Uint8Array(textLength);
	text.set(merged.code.bytes, 0);
	const data = new Uint8Array(totalDataLength);
	data.set(merged.data.bytes, 0);

	const rela = [];
	const undefinedSymbols = [
		...undefinedFunctions.map(name => ({ kind: "function", name })),
		...undefinedData.map(name => ({ kind: "data", name }))
	];
	const undefinedIndex = new Map();
	undefinedSymbols.forEach((entry, position) => {
		undefinedIndex.set(entry.name, exportNames.length + 1 + position);
	});

	writePltStubs(text, codeLength, undefinedFunctions, pltAddresses, gotAddresses);

	let staticRelocations = 0;
	let pltRelocations = 0;
	for (let objectIndex = 0; objectIndex < normalized.length; objectIndex += 1) {
		const object = normalized[objectIndex];
		for (const relocation of object.relocations) {
			const sourceBase = relocation.sourceSection === "code" ? codeBase : dataBase;
			const sectionBase = relocation.sourceSection === "code"
				? merged.codeBases[objectIndex]
				: merged.dataBases[objectIndex];
			const sourceVaddr = sourceBase + sectionBase + relocation.sourceOffset;
			const target = relocation.targetSymbol;
			if (symbolAddresses.has(target)) {
				const targetVaddr = symbolAddresses.get(target) + relocation.addend;
				applyStaticRelocation(
					relocation, sourceVaddr, targetVaddr,
					relocation.sourceSection === "code" ? text : data,
					sectionBase + relocation.sourceOffset
				);
				staticRelocations += 1;
				continue;
			}
			if (relocation.kind === "arm64_bl" && pltAddresses.has(target)) {
				applyBranchRelocation(text, sectionBase + relocation.sourceOffset, sourceVaddr, pltAddresses.get(target), "arm64_bl");
				pltRelocations += 1;
				continue;
			}
			if (relocation.kind === "arm64_abs64" && undefinedData.includes(target)) {
				const at = sectionBase + relocation.sourceOffset;
				new DataView(data.buffer, data.byteOffset, data.byteLength)
					.setBigUint64(at, BigInt(relocation.addend), true);
				rela.push(Object.freeze({
					addend: relocation.addend,
					offset: dataBase + at,
					symbolIndex: undefinedIndex.get(target),
					type: AARCH64_RELOCATIONS.R_AARCH64_GLOB_DAT
				}));
				continue;
			}
			throw linkerError(
				"ARM64_LINK_UNRESOLVED",
				`${object.name}:${relocation.kind} -> ${target}`
			);
		}
	}

	undefinedFunctions.forEach(name => {
		rela.push(Object.freeze({
			addend: 0,
			offset: gotAddresses.get(name),
			symbolIndex: undefinedIndex.get(name),
			type: AARCH64_RELOCATIONS.R_AARCH64_JUMP_SLOT
		}));
	});

	const exports = exportNames.map(name => {
		const symbol = defined.get(name);
		const size = symbolSize(symbol, defined, merged, name);
		return Object.freeze({ name, offset: symbol.mergedOffset, size });
	});

	return Object.freeze({
		data,
		exports,
		layout,
		needed,
		rela: Object.freeze(rela),
		soname,
		text,
		undefinedSymbols: Object.freeze(undefinedSymbols),
		evidence: Object.freeze({
			dataAddress: layout.dataAddress,
			dataLength: totalDataLength,
			definedSymbols: defined.size,
			objectCount: normalized.length,
			pltStubs: undefinedFunctions.length,
			pltRelocations,
			staticRelocations,
			textAddress: layout.textAddress,
			textLength,
			undefinedSymbols: undefinedSymbols.length,
			version: "awtsmoos-arm64-link-v1"
		})
	});
}

function normalizeObjects(objects) {
	if (!Array.isArray(objects) || !objects.length || objects.length > 256) {
		throw linkerError("ARM64_LINK_COUNT", String(objects?.length ?? -1));
	}
	return Object.freeze(objects.map(object => createArm64Object(object)));
}

function mergeSections(objects) {
	const codeBases = [];
	const dataBases = [];
	let codeLength = 0;
	let dataLength = 0;
	for (const object of objects) {
		const code = sectionBytes(object, "code");
		const data = sectionBytes(object, "data");
		codeLength = alignUp(codeLength, 4);
		codeBases.push(codeLength);
		codeLength += code.length;
		dataLength = alignUp(dataLength, 8);
		dataBases.push(dataLength);
		dataLength += data.length;
	}
	const code = new Uint8Array(codeLength);
	const data = new Uint8Array(dataLength);
	objects.forEach((object, index) => {
		code.set(sectionBytes(object, "code"), codeBases[index]);
		data.set(sectionBytes(object, "data"), dataBases[index]);
	});
	return {
		code: { bytes: code },
		codeBases: Object.freeze(codeBases),
		data: { bytes: data },
		dataBases: Object.freeze(dataBases)
	};
}

function sectionBytes(object, name) {
	const section = object.sections.find(candidate => candidate.name === name);
	return section ? section.bytes : new Uint8Array();
}

function resolveDefinedSymbols(objects, merged) {
	const defined = new Map();
	objects.forEach((object, objectIndex) => {
		for (const symbol of object.symbols) {
			const key = symbol.binding === "global" ? symbol.name : `${object.name}::${symbol.name}`;
			if (symbol.binding === "global" && defined.has(key)) {
				throw linkerError("ARM64_LINK_SYMBOL_DUPLICATE", symbol.name);
			}
			const mergedOffset = symbol.section === "code"
				? merged.codeBases[objectIndex] + symbol.offset
				: merged.dataBases[objectIndex] + symbol.offset;
			defined.set(key, { ...symbol, mergedOffset, objectName: object.name });
		}
	});
	return defined;
}

function collectUndefinedFunctions(objects, defined) {
	const names = [];
	for (const object of objects) {
		for (const relocation of object.relocations) {
			if (CODE_RELOCATION_KINDS.has(relocation.kind) && !defined.has(relocation.targetSymbol)) {
				if (relocation.kind !== "arm64_bl") {
					throw linkerError(
						"ARM64_LINK_UNDEFINED_CODE_REFERENCE",
						`${object.name}:${relocation.kind} -> ${relocation.targetSymbol}`
					);
				}
				if (!names.includes(relocation.targetSymbol)) names.push(relocation.targetSymbol);
			}
		}
	}
	return Object.freeze(names);
}

function collectUndefinedData(objects, defined) {
	const names = [];
	for (const object of objects) {
		for (const relocation of object.relocations) {
			if (relocation.kind === "arm64_abs64" && !defined.has(relocation.targetSymbol)) {
				if (!names.includes(relocation.targetSymbol)) names.push(relocation.targetSymbol);
			}
		}
	}
	return Object.freeze(names);
}

function resolveExportNames(requested, defined) {
	if (requested !== undefined) {
		if (!Array.isArray(requested)) throw linkerError("ARM64_LINK_EXPORTS_ARRAY");
		return Object.freeze(requested.map(name => {
			const symbolName = String(name);
			const symbol = defined.get(symbolName);
			if (!symbol || symbol.kind !== "function" || symbol.section !== "code") {
				throw linkerError("ARM64_LINK_EXPORT_UNKNOWN", symbolName);
			}
			return symbolName;
		}));
	}
	const names = [];
	for (const [name, symbol] of defined) {
		if (!name.includes("::") && symbol.kind === "function" && symbol.section === "code") {
			names.push(name);
		}
	}
	return Object.freeze(names);
}

function symbolSize(symbol, defined, merged, name) {
	let next = Infinity;
	for (const [otherName, other] of defined) {
		if (otherName === name || other.section !== symbol.section) continue;
		if (other.mergedOffset > symbol.mergedOffset && other.mergedOffset < next) {
			next = other.mergedOffset;
		}
	}
	const sectionLength = symbol.section === "code"
		? merged.code.bytes.length
		: merged.data.bytes.length;
	return (next === Infinity ? sectionLength : next) - symbol.mergedOffset;
}

function writePltStubs(text, codeLength, undefinedFunctions, pltAddresses, gotAddresses) {
	const view = new DataView(text.buffer, text.byteOffset, text.byteLength);
	undefinedFunctions.forEach((name, index) => {
		const stubOffset = codeLength + index * PLT_STUB_SIZE;
		const stubVaddr = pltAddresses.get(name);
		const gotVaddr = gotAddresses.get(name);
		const pageOffset = Math.trunc(gotVaddr / PAGE_SIZE) - Math.trunc(stubVaddr / PAGE_SIZE);
		const lo12 = gotVaddr & 0xFFF;
		view.setUint32(stubOffset, encodeAdrp(PLT_SCRATCH_REGISTER, pageOffset), true);
		view.setUint32(stubOffset + 4, encodeLdrImm64(PLT_SCRATCH_REGISTER, PLT_SCRATCH_REGISTER, lo12), true);
		view.setUint32(stubOffset + 8, encodeBr(PLT_SCRATCH_REGISTER), true);
	});
}

// --- AArch64 instruction encoding (linker-owned, mirrors encoder.js) ---

function encodeAdrp(rd, pageOffset) {
	if (pageOffset < -(1 << 20) || pageOffset > (1 << 20) - 1) {
		throw linkerError("ARM64_LINK_ADRP_RANGE", String(pageOffset));
	}
	const imm = pageOffset & 0x1FFFFF;
	const immlo = imm & 0x3;
	const immhi = (imm >> 2) & 0x7FFFF;
	return ((1 << 31) | (immlo << 29) | (0b10000 << 24) | (immhi << 5) | (rd & 0x1F)) >>> 0;
}

function encodeLdrImm64(rt, rn, byteOffset) {
	if (byteOffset % 8 !== 0 || byteOffset < 0 || byteOffset > 0xFFF * 8) {
		throw linkerError("ARM64_LINK_LDR_RANGE", String(byteOffset));
	}
	const imm12 = byteOffset / 8;
	// LDR Xt,[Xn,#imm]: size=11 opc=01 111001, imm12 scaled by 8.
	return (((0b11 << 30) | (0b111001 << 24) | (0b01 << 22) | (imm12 << 10) | ((rn & 0x1F) << 5) | (rt & 0x1F))) >>> 0;
}

function encodeBr(rn) {
	// BR Xn: 11010110000 11111 000000 Rn 00000
	return (((0b11010110000 << 21) | (0b11111 << 16) | (0b000000 << 10) | ((rn & 0x1F) << 5))) >>> 0;
}

function encodeBranch(kind, wordOffset) {
	if (wordOffset < -(1 << 25) || wordOffset > (1 << 25) - 1) {
		throw linkerError("ARM64_LINK_BRANCH_RANGE", `${kind}:${wordOffset}`);
	}
	const imm = wordOffset & 0x3FFFFFF;
	const op = kind === "arm64_bl" ? 0b100101 : 0b000101;
	return ((op << 26) | imm) >>> 0;
}

function encodeAdr(rd, byteOffset) {
	if (byteOffset < -(1 << 20) || byteOffset > (1 << 20) - 1) {
		throw linkerError("ARM64_LINK_ADR_RANGE", String(byteOffset));
	}
	const imm = byteOffset & 0x1FFFFF;
	const immlo = imm & 0x3;
	const immhi = (imm >> 2) & 0x7FFFF;
	return (((immlo << 29) | (0b10000 << 24) | (immhi << 5) | (rd & 0x1F))) >>> 0;
}

function encodeCbz(rt, wordOffset, sf, isCbnz) {
	if (wordOffset < -(1 << 18) || wordOffset > (1 << 18) - 1) {
		throw linkerError("ARM64_LINK_CBZ_RANGE", String(wordOffset));
	}
	const base = isCbnz ? 0b10110101 : 0b10110100;
	const opcode = sf === 64 ? base : base & 0b01110101;
	const imm = wordOffset & 0x7FFFF;
	return (((opcode) << 24) | (imm << 5) | (rt & 0x1F)) >>> 0;
}

function encodeBcond(cond, wordOffset) {
	if (wordOffset < -(1 << 18) || wordOffset > (1 << 18) - 1) {
		throw linkerError("ARM64_LINK_BCOND_RANGE", String(wordOffset));
	}
	const imm = wordOffset & 0x7FFFF;
	return (((0b01010100) << 24) | (imm << 5) | (cond & 0xF)) >>> 0;
}

function encodeLdrLiteral(rt, wordOffset, sf) {
	if (wordOffset < -(1 << 18) || wordOffset > (1 << 18) - 1) {
		throw linkerError("ARM64_LINK_LITERAL_RANGE", String(wordOffset));
	}
	const opc = sf === 64 ? 0b01 : 0b00;
	const imm = wordOffset & 0x7FFFF;
	return (((opc << 30) | (0b011000 << 24) | (imm << 5) | (rt & 0x1F))) >>> 0;
}

function encodeAddSubImm(isSub, rd, rn, imm12, sh, sf) {
	if (imm12 < 0 || imm12 > 0xFFF) throw linkerError("ARM64_LINK_LO12_RANGE", String(imm12));
	const s = sf === 64 ? 1 : 0;
	const op = isSub ? 1 : 0;
	return (((s << 31) | (op << 30) | (0 << 29) | (0b100010 << 23) | (sh << 22) | (imm12 << 10) | ((rn & 0x1F) << 5) | (rd & 0x1F))) >>> 0;
}

function applyStaticRelocation(relocation, sourceVaddr, targetVaddr, bytes, at) {
	if (relocation.kind === "arm64_abs64") {
		new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength)
			.setBigUint64(at, BigInt(targetVaddr), true);
		return;
	}
	applyBranchRelocation(bytes, at, sourceVaddr, targetVaddr, relocation.kind);
}

function applyBranchRelocation(bytes, at, sourceVaddr, targetVaddr, kind) {
	const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
	const existing = view.getUint32(at, true);
	const wordOffset = Math.trunc((targetVaddr - sourceVaddr) / 4);
	let encoded;
	switch (kind) {
		case "arm64_b":
		case "arm64_bl":
			assertOpcode(existing, [0b000101, 0b100101], 26, 6, kind);
			encoded = encodeBranch(kind, wordOffset);
			break;
		case "arm64_cbz":
		case "arm64_cbnz": {
			const rt = existing & 0x1F;
			const sf = (existing >>> 31) & 1;
			assertCbzOpcode(existing, kind);
			encoded = encodeCbz(rt, wordOffset, sf, kind === "arm64_cbnz");
			break;
		}
		case "arm64_bcond": {
			const cond = existing & 0xF;
			assertOpcode(existing, [0b01010100], 24, 8, kind);
			encoded = encodeBcond(cond, wordOffset);
			break;
		}
		case "arm64_adr": {
			const rd = existing & 0x1F;
			assertOpcode(existing, [0b10000], 24, 5, kind);
			if ((existing >>> 31) & 1) throw linkerError("ARM64_LINK_OPCODE_MISMATCH", kind);
			const byteOffset = targetVaddr - sourceVaddr;
			encoded = encodeAdr(rd, byteOffset);
			break;
		}
		case "arm64_adrp": {
			const rd = existing & 0x1F;
			assertOpcode(existing, [0b10000], 24, 5, kind);
			if (!((existing >>> 31) & 1)) throw linkerError("ARM64_LINK_OPCODE_MISMATCH", kind);
			const pageOffset = Math.trunc(targetVaddr / PAGE_SIZE) - Math.trunc(sourceVaddr / PAGE_SIZE);
			encoded = encodeAdrp(rd, pageOffset);
			break;
		}
		case "arm64_lo12": {
			const rd = existing & 0x1F;
			const rn = (existing >>> 5) & 0x1F;
			const sh = (existing >>> 22) & 1;
			const sf = (existing >>> 31) & 1;
			const isSub = ((existing >>> 30) & 1) === 1;
			assertOpcode(existing, [0b100010], 23, 6, kind);
			const imm12 = isSub ? ((-targetVaddr) & 0xFFF) : (targetVaddr & 0xFFF);
			encoded = encodeAddSubImm(isSub, rd, rn, imm12, sh, sf);
			break;
		}
		case "arm64_ldr_literal": {
			const rt = existing & 0x1F;
			const sf = ((existing >>> 30) & 0b11) === 0b01 ? 64 : 32;
			assertOpcode(existing, [0b011000], 24, 6, kind);
			encoded = encodeLdrLiteral(rt, wordOffset, sf);
			break;
		}
		default:
			throw linkerError("ARM64_LINK_KIND", kind);
	}
	view.setUint32(at, encoded, true);
}

function assertOpcode(word, expected, shift, width, kind) {
	const mask = (1 << width) - 1;
	const actual = (word >>> shift) & mask;
	if (!expected.includes(actual)) {
		throw linkerError("ARM64_LINK_OPCODE_MISMATCH", `${kind}:0x${word.toString(16)}`);
	}
}

function assertCbzOpcode(word, kind) {
	const top = (word >>> 24) & 0xFF;
	const want = kind === "arm64_cbnz"
		? [0b00110101, 0b10110101]
		: [0b00110100, 0b10110100];
	if (!want.includes(top)) throw linkerError("ARM64_LINK_OPCODE_MISMATCH", `${kind}:0x${word.toString(16)}`);
}

function linkerError(code, detail = "") {
	const error = new Error(detail ? `${code}:${detail}` : code);
	error.code = code;
	return error;
}
