//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
	compilePortableCLibrary,
	compilePortableCLibrarySet
} from "../../c/library.js";

const HERE = dirname(fileURLToPath(import.meta.url));
const SRC = join(HERE, "..", "src");
const readSource = rel => readFileSync(join(SRC, rel), "utf8");

// --- Minimal ELF64 reader -------------------------------------------------
// Parses the linker's own output bytes: no trust in linker evidence objects,
// the .so bytes themselves must prove ELF validity and export membership.

const ET_DYN = 3;
const EM_AARCH64 = 183;
const PT_DYNAMIC = 2;
const DT_NULL = 0;
const DT_NEEDED = 1;
const DT_HASH = 4;
const DT_STRTAB = 5;
const DT_SYMTAB = 6;
const DT_SONAME = 14;
const STB_GLOBAL = 1;
const STT_FUNC = 2;
const SHN_UNDEF = 0;

function parseElfSharedObject(bytes) {
	const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
	assert.equal(bytes[0], 0x7f, "ELF magic 0");
	assert.equal(bytes[1], 0x45, "ELF magic E");
	assert.equal(bytes[2], 0x4c, "ELF magic L");
	assert.equal(bytes[3], 0x46, "ELF magic F");
	assert.equal(bytes[4], 2, "ELFCLASS64");
	assert.equal(bytes[5], 1, "ELFDATA2LSB");
	assert.equal(view.getUint16(16, true), ET_DYN, "ET_DYN");
	assert.equal(view.getUint16(18, true), EM_AARCH64, "EM_AARCH64");
	const e_phoff = Number(view.getBigUint64(32, true));
	const e_phentsize = view.getUint16(54, true);
	const e_phnum = view.getUint16(56, true);
	let dynamicAddr = 0;
	for (let i = 0; i < e_phnum; i += 1) {
		const at = e_phoff + i * e_phentsize;
		if (view.getUint32(at, true) === PT_DYNAMIC) {
			dynamicAddr = Number(view.getBigUint64(at + 8, true));
			break;
		}
	}
	assert.ok(dynamicAddr > 0, "PT_DYNAMIC present");
	const tags = new Map();
	const neededOffsets = [];
	for (let at = dynamicAddr; ; at += 16) {
		const tag = Number(view.getBigInt64(at, true));
		const value = Number(view.getBigUint64(at + 8, true));
		if (tag === DT_NULL) break;
		if (tag === DT_NEEDED) neededOffsets.push(value);
		else tags.set(tag, value);
	}
	const strtab = tags.get(DT_STRTAB);
	const symtab = tags.get(DT_SYMTAB);
	const hash = tags.get(DT_HASH);
	assert.ok(strtab, "DT_STRTAB present");
	assert.ok(symtab, "DT_SYMTAB present");
	assert.ok(hash, "DT_HASH present");
	const readString = offset => {
		let end = offset;
		while (bytes[end] !== 0) end += 1;
		return new TextDecoder().decode(bytes.subarray(offset, end));
	};
	const symbolCount = view.getUint32(hash + 4, true); // nchain
	assert.ok(symbolCount >= 1, "dynsym has entries");
	const symbols = [];
	for (let i = 0; i < symbolCount; i += 1) {
		const at = symtab + i * 24;
		const info = bytes[at + 4];
		symbols.push({
			bind: info >> 4,
			defined: view.getUint16(at + 6, true) !== SHN_UNDEF,
			name: readString(strtab + view.getUint32(at, true)),
			type: info & 0xf,
			value: Number(view.getBigUint64(at + 8, true))
		});
	}
	return {
		needed: neededOffsets.map(offset => readString(strtab + offset)),
		soname: readString(strtab + tags.get(DT_SONAME)),
		symbols
	};
}

function definedFunctionNames(elf) {
	return elf.symbols
		.filter(s => s.defined && s.bind === STB_GLOBAL && s.type === STT_FUNC)
		.map(s => s.name);
}

function undefinedNames(elf) {
	return elf.symbols.filter(s => !s.defined && s.name !== "").map(s => s.name);
}

// --- Module compilations ---------------------------------------------------

const MODULES = {
	math: {
		file: "java_lang/java_lang_math.c",
		soname: "libawtsmoos_java_lang_math.so",
		exports: [
			"java_lang_Math_abs",
			"java_lang_Math_min",
			"java_lang_Math_max",
			"java_lang_Math_signum"
		]
	},
	character: {
		file: "java_lang/java_lang_character.c",
		soname: "libawtsmoos_java_lang_character.so",
		exports: [
			"java_lang_Character_isDigit",
			"java_lang_Character_isLetter",
			"java_lang_Character_isWhitespace",
			"java_lang_Character_toLowerCase",
			"java_lang_Character_toUpperCase"
		]
	},
	integer: {
		file: "java_lang/java_lang_integer.c",
		soname: "libawtsmoos_java_lang_integer.so",
		exports: [
			"java_lang_Integer_bitCount",
			"java_lang_Integer_numberOfLeadingZeros",
			"java_lang_Integer_signum",
			"java_lang_Integer_compare",
			"java_lang_Integer_min",
			"java_lang_Integer_max",
			"java_lang_Integer_sum",
			"java_lang_Integer_digitValue",
			"java_lang_Integer_toDigitChar",
			"java_lang_Integer_parseInt",
			"java_lang_Integer_toStringRadix",
			"java_lang_Integer_toString",
			"java_lang_Integer_toHexString",
			"java_lang_Integer_toOctalString",
			"java_lang_Integer_toBinaryString"
		]
	},
	log: {
		file: "android_util/android_util_log.c",
		soname: "libawtsmoos_android_util_log.so",
		exports: ["android_util_Log_isLoggable"]
	}
};

for (const [name, spec] of Object.entries(MODULES)) {
	test(`runtime module ${name} compiles to a valid .so with its exports`, () => {
		const source = readSource(spec.file);
		const linked = compilePortableCLibrary(source, { soname: spec.soname });
		const elf = parseElfSharedObject(linked.bytes);
		assert.equal(elf.soname, spec.soname);
		const defined = definedFunctionNames(elf);
		for (const exportName of spec.exports) {
			assert.ok(
				defined.includes(exportName),
				`expected defined export ${exportName}; got ${JSON.stringify(defined)}`
			);
		}
		assert.deepEqual(undefinedNames(elf), [], "no undefined symbols");
	});
}

// --- Extern support ---------------------------------------------------------

test("extern call to an undefined name becomes a dynamic import", () => {
	const linked = compilePortableCLibrary(
		"extern int ext_add(int a, int b);\n" +
		"int use_it(int x) { return ext_add(x, 41); }\n",
		{ exports: ["use_it"], soname: "libextern_smoke.so" }
	);
	const elf = parseElfSharedObject(linked.bytes);
	assert.ok(definedFunctionNames(elf).includes("use_it"));
	assert.ok(
		undefinedNames(elf).includes("ext_add"),
		`ext_add must be an undefined dynsym entry; got ${JSON.stringify(undefinedNames(elf))}`
	);
	assert.equal(linked.linker.pltStubs, 1, "one PLT stub synthesized");
});

test("cross-module extern call resolves statically with no PLT", () => {
	const linked = compilePortableCLibrarySet(
		[
			{
				name: "mod-helper",
				source: "int helper(int x) { return x * 2; }\n"
			},
			{
				name: "mod-user",
				source: "extern int helper(int x);\n" +
					"int doubled(int x) { return helper(x) + 1; }\n"
			}
		],
		{ soname: "libcrossmod.so" }
	);
	const elf = parseElfSharedObject(linked.bytes);
	const defined = definedFunctionNames(elf);
	assert.ok(defined.includes("helper"), "helper defined");
	assert.ok(defined.includes("doubled"), "doubled defined");
	assert.deepEqual(undefinedNames(elf), [], "no undefined symbols after static link");
	assert.equal(linked.linker.pltStubs, 0, "no PLT stubs for defined cross-module call");
	assert.ok(
		linked.linker.staticRelocations > 0,
		"the cross-module BL was statically re-encoded"
	);
});

test("extern libc call carries DT_NEEDED for load-time binding", () => {
	const linked = compilePortableCLibrary(
		"extern int write(int fd, char *buf, int n);\n" +
		"int shout(char *buf, int n) { return write(1, buf, n); }\n",
		{ exports: ["shout"], needed: ["libc.so"], soname: "libsyscall.so" }
	);
	const elf = parseElfSharedObject(linked.bytes);
	assert.ok(elf.needed.includes("libc.so"), `DT_NEEDED carries libc.so; got ${JSON.stringify(elf.needed)}`);
	assert.ok(undefinedNames(elf).includes("write"), "write stays an undefined import");
});

test("calls to undeclared functions are still rejected", () => {
	assert.throws(
		() => compilePortableCLibrary("int bad(void) { return nosuchfn(1); }\n"),
		error => error?.code === "PORTABLE_C_CALL_UNRESOLVED"
	);
});

test("legacy import syntax lowers to the same extern machinery", () => {
	const linked = compilePortableCLibrary(
		"import \"libc.so\" puts;\nint shout(void) { return puts(0); }\n",
		{ needed: ["libc.so"] }
	);
	const elf = parseElfSharedObject(linked.bytes);
	assert.ok(undefinedNames(elf).includes("puts"), "puts is an undefined import");
	assert.equal(linked.linker.pltStubs, 1);
});
