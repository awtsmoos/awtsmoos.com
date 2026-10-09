//B"H
//Boruch Hashem
//Blessed is He

import {
	buildIrModule,
	verifyIrModule
} from "../../pe/c/ir/index.js";
import { tokenize } from "../../pe/c/lexer.js";
import { parse } from "../../pe/c/parser/index.js";
import { preprocessC } from "../../pe/c/preprocessor.js";
import {
	createArm64Object,
	linkArm64ObjectsToSharedObject
} from "../../../../../shared/compiling/native/elf64/arm64Linker.js";
import { assembleArm64 } from "../arm64/index.js";
import { generatePortableCAssembly } from "./codegen.js";
import { portableCError } from "./errors.js";

/**
 * Complete assembler relocation kind -> linker relocation kind map.
 * The Awtsmoos creates every branch and address kind anew; Awtsmoos.com
 * maps them all so no PC-relative reference is silently left unlinked.
 */
const ARM64_RELOC_KIND_MAP = Object.freeze({
	bl: "arm64_bl",
	b: "arm64_b",
	cbz: "arm64_cbz",
	cbnz: "arm64_cbnz",
	bcond: "arm64_bcond",
	adr: "arm64_adr",
	adrp: "arm64_adrp",
	lo12: "arm64_lo12",
	ldrLiteral: "arm64_ldr_literal",
	abs64: "arm64_abs64"
});

const DEFAULT_LIMITS = Object.freeze({
	sourceCharacters: 1000000,
	tokens: 100000
});

/**
 * Compiles C source to a position-independent ELF64 shared object (.so).
 * Library mode: no main requirement, no startup stub, exported entry points.
 *
 * `extern` function declarations are supported: a call to an extern name
 * emits an external relocation. Names still undefined at link time become
 * PLT/GOT dynamic imports (e.g. libc calls with `needed: ["libc.so"]`).
 *
 * options:
 *   exports: string[]  - function names to export (default: all functions)
 *   soname: string     - DT_SONAME (default "libawtsmoos.so")
 *   name: string       - object name for diagnostics (default "awtsmoos-library")
 *   needed: string[]   - DT_NEEDED entries (default [])
 *   limits: { sourceCharacters, tokens }
 *
 * Returns the linker result: { bytes, ...linker evidence }.
 */
export function compilePortableCLibrary(source, options = {}) {
	const unit = compilePortableCUnit(source, options);
	const linked = linkPortableCObjects([unit.object], {
		exports: options.exports || [...unit.gen.exports],
		needed: options.needed || [],
		soname: options.soname || "libawtsmoos.so"
	});
	return Object.freeze({
		...linked,
		assembly: unit.assembly,
		exports: unit.gen.exports,
		irVerification: unit.irVerification,
		libraryMode: true
	});
}

/**
 * Compiles one C translation unit to an Awtsmoos AArch64 object
 * ("awtsmoos-object-v1") without linking. Extern calls stay as external
 * relocations; linkPortableCObjects resolves them afterwards.
 *
 * options: same as compilePortableCLibrary (exports/needed/soname are
 * link-time and ignored here; `name` names the object for diagnostics).
 */
export function compilePortableCObject(source, options = {}) {
	return compilePortableCUnit(source, options).object;
}

/**
 * Compiles several C translation units and links them into one .so, so
 * runtime modules can call each other. An extern call whose target is
 * defined in another unit resolves statically (no PLT); a name defined in
 * no unit becomes a dynamic import exactly as in compilePortableCLibrary.
 *
 * entries: Array<string | { source: string, name?: string, exports?: string[] }>
 * options:
 *   exports: string[]  - .so export list (default: union of unit exports)
 *   soname: string     - DT_SONAME (default "libawtsmoos.so")
 *   needed: string[]   - DT_NEEDED entries (default [])
 *   limits: { sourceCharacters, tokens }
 */
export function compilePortableCLibrarySet(entries, options = {}) {
	if (!Array.isArray(entries) || entries.length < 1) {
		throw portableCError(
			"PORTABLE_C_LIBRARY_SET_EMPTY",
			"compilePortableCLibrarySet requires at least one entry"
		);
	}
	const units = entries.map(entry => {
		const isText = typeof entry === "string";
		const unitOptions = { ...options };
		if (!isText) {
			if (entry.name !== undefined) unitOptions.name = entry.name;
			if (entry.exports !== undefined) unitOptions.exports = entry.exports;
		}
		return compilePortableCUnit(isText ? entry : entry.source, unitOptions);
	});
	const exports = options.exports
		|| [...new Set(units.flatMap(unit => [...unit.gen.exports]))];
	const linked = linkPortableCObjects(
		units.map(unit => unit.object),
		{
			exports,
			needed: options.needed || [],
			soname: options.soname || "libawtsmoos.so"
		}
	);
	return Object.freeze({
		...linked,
		assemblies: Object.freeze(units.map(unit => unit.assembly)),
		exports: Object.freeze(exports),
		libraryMode: true,
		unitCount: units.length
	});
}

/**
 * Links already-compiled Awtsmoos AArch64 objects (see compilePortableCObject)
 * into one position-independent ELF64 shared object. Cross-module symbols
 * resolve statically; still-undefined function names become PLT/GOT imports.
 *
 * options:
 *   exports: string[]  - function names to export (default: all defined)
 *   soname: string     - DT_SONAME (default "libawtsmoos.so")
 *   needed: string[]   - DT_NEEDED entries (default [])
 */
export function linkPortableCObjects(objects, options = {}) {
	return linkArm64ObjectsToSharedObject(objects, {
		exports: options.exports,
		needed: options.needed || [],
		soname: options.soname || "libawtsmoos.so"
	});
}

/**
 * Runs the full front end (preprocess, lex, parse, IR, codegen, assemble)
 * for one translation unit and wraps the result as a linker object.
 */
function compilePortableCUnit(source, options = {}) {
	const sourceText = String(source);
	const limits = { ...DEFAULT_LIMITS, ...(options.limits || {}) };
	if (sourceText.length > limits.sourceCharacters) {
		throw portableCError(
			"PORTABLE_C_SOURCE_LIMIT",
			"Portable C source exceeds the configured character limit"
		);
	}
	const processedSource = preprocessC(sourceText);
	const tokens = tokenize(processedSource, {
		maximumTokens: limits.tokens
	});
	const ast = parse(tokens);
	const irModule = buildIrModule(ast, {
		sourceLanguage: "awtsmoos-c-subset-v1"
	});
	const irVerification = verifyIrModule(irModule);
	const gen = generatePortableCAssembly(irModule, "linux-arm64-shared", {
		exports: options.exports,
		mode: "library"
	});
	const text = Array.isArray(gen.assembly) ? gen.assembly.join("\n") : gen.assembly;
	const assembled = assembleArm64(text);
	const object = buildLibraryObject(assembled, gen, options);
	return Object.freeze({
		assembly: text,
		gen,
		irVerification,
		object
	});
}

/**
 * Splits assembled code+data into linker sections and maps every relocation.
 * All symbols are global so internal branches resolve; the linker exports
 * only the requested names to .dynsym. Relocations whose target is not a
 * defined symbol stay external: the linker binds them to another object or
 * synthesizes a PLT/GOT dynamic import.
 */
function buildLibraryObject(assembled, gen, options = {}) {
	const codeSize = assembled.codeSize ?? assembled.bytes.length;
	const code = assembled.bytes.slice(0, codeSize);
	const data = assembled.bytes.slice(codeSize);
	const sections = [
		{
			alignment: 4,
			bytes: code,
			name: "code",
			permissions: { execute: true, read: true }
		}
	];
	if (data.length > 0) {
		sections.push({
			alignment: 8,
			bytes: data,
			name: "data",
			permissions: { read: true, write: true }
		});
	}
	const symbols = Object.entries(assembled.symbols).map(([name, offset]) => {
		const inCode = offset < codeSize;
		return {
			binding: "global",
			kind: inCode ? "function" : "data",
			name,
			offset: inCode ? offset : offset - codeSize,
			section: inCode ? "code" : "data"
		};
	});
	const relocations = assembled.relocations.map(r => {
		const kind = ARM64_RELOC_KIND_MAP[r.type];
		if (!kind) {
			throw portableCError(
				"PORTABLE_C_RELOC_KIND",
				`Unsupported ARM64 relocation kind '${r.type}' for library linking`
			);
		}
		const inCode = r.offset < codeSize;
		return {
			addend: 0,
			kind,
			sourceOffset: inCode ? r.offset : r.offset - codeSize,
			sourceSection: inCode ? "code" : "data",
			targetSymbol: r.target
		};
	});
	return createArm64Object({
		architecture: "aarch64",
		name: options.name || "awtsmoos-library",
		relocations,
		sections,
		symbols,
		version: "awtsmoos-object-v1"
	});
}
