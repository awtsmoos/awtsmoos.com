//B"H
//Boruch Hashem
//Blessed is He

/**
 * Tests for C compiler library mode (C -> position-independent .so).
 *
 * Yaakov: "Every feature that is emulated should also be able to be compiled."
 * Library mode closes the executable-only gap: NativeActivity entry points
 * like ANativeActivity_onCreate can now be compiled with 100% Awtsmoos code.
 */

import assert from "node:assert/strict";
import test from "node:test";
import { execFileSync } from "node:child_process";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { compilePortableCLibrary } from "../native/c/library.js";
import { generatePortableCAssembly } from "../native/c/codegen.js";
import { buildIrModule } from "../pe/c/ir/index.js";
import { tokenize } from "../pe/c/lexer.js";
import { parse } from "../pe/c/parser/index.js";
import { preprocessC } from "../pe/c/preprocessor.js";

function buildIr(src) {
	return buildIrModule(
		parse(tokenize(preprocessC(src), { maximumTokens: 100000 })),
		{ sourceLanguage: "awtsmoos-c-subset-v1" }
	);
}

function runTool(binary, args) {
	try {
		return { ok: true, output: execFileSync(binary, args, { encoding: "utf8", timeout: 30000 }) };
	} catch (e) {
		return { ok: false, output: String(e.message).slice(0, 300) };
	}
}

test("library: codegen has no startup stub and no main requirement", () => {
	const gen = generatePortableCAssembly(
		buildIr("void ANativeActivity_onCreate(void* a, void* b, int c) { return; }"),
		"linux-arm64-shared",
		{ exports: ["ANativeActivity_onCreate"], mode: "library" }
	);
	assert.ok(gen.libraryMode, "not marked as library mode");
	assert.ok(!gen.assembly.includes("start:"), "startup stub leaked into library");
	assert.ok(!gen.assembly.includes("SYSCALL"), "exit syscall leaked into library");
	assert.deepEqual(gen.exports, ["ANativeActivity_onCreate"]);
});

test("library: missing export is rejected", () => {
	try {
		generatePortableCAssembly(
			buildIr("int foo() { return 1; }"),
			"linux-arm64-shared",
			{ exports: ["ANativeActivity_onCreate"], mode: "library" }
		);
		assert.fail("should have thrown");
	} catch (e) {
		assert.equal(e.code, "PORTABLE_C_EXPORT_MISSING");
	}
});

test("library: executable mode still requires main", () => {
	try {
		generatePortableCAssembly(
			buildIr("int foo() { return 1; }"),
			"linux-arm64"
		);
		assert.fail("should have thrown");
	} catch (e) {
		assert.equal(e.code, "PORTABLE_C_MAIN_MISSING");
	}
});

test("library: ANativeActivity_onCreate links to valid .so (readelf)", () => {
	const lib = compilePortableCLibrary(
		"void ANativeActivity_onCreate(void* activity, void* savedState, int savedStateSize) { return; }",
		{ exports: ["ANativeActivity_onCreate"], soname: "libmerkava.so", name: "merkava-test" }
	);
	assert.ok(lib.bytes.length > 0, "empty .so");

	const dir = mkdtempSync(join(tmpdir(), "awtsmoos-libtest-"));
	const path = join(dir, "libmerkava.so");
	writeFileSync(path, lib.bytes);

	const header = runTool("/usr/bin/readelf", ["-h", path]);
	assert.ok(header.ok, "readelf failed");
	assert.ok(header.output.includes("DYN (Shared object file)"), "not ET_DYN");
	assert.ok(header.output.includes("AArch64"), "not AArch64");

	const soname = runTool("/usr/bin/readelf", ["-d", path]);
	assert.ok(soname.ok, "readelf -d failed");
	assert.ok(soname.output.includes("libmerkava.so"), "SONAME missing");

	const syms = runTool("/usr/bin/objdump", ["-T", path]);
	assert.ok(syms.ok, "objdump -T failed");
	assert.ok(syms.output.includes("ANativeActivity_onCreate"), "export missing from .dynsym");
});

test("library: only requested symbols are exported", () => {
	const lib = compilePortableCLibrary(
		"void ANativeActivity_onCreate(void* a, void* b, int c) { return; }\n" +
		"int internal_helper(int x) { return x + 1; }",
		{ exports: ["ANativeActivity_onCreate"], soname: "libmerkava.so" }
	);
	const dir = mkdtempSync(join(tmpdir(), "awtsmoos-libtest-"));
	const path = join(dir, "libmerkava.so");
	writeFileSync(path, lib.bytes);
	const syms = runTool("/usr/bin/objdump", ["-T", path]);
	assert.ok(syms.ok, "objdump -T failed");
	assert.ok(syms.output.includes("ANativeActivity_onCreate"), "export missing");
	assert.ok(!syms.output.includes("internal_helper"), "non-exported function leaked to .dynsym");
});

test("library: branches link correctly (bcond regression)", () => {
	// The e2e RELOC_KIND_MAP once lacked bcond; this proves all branch
	// kinds survive the library link.
	const lib = compilePortableCLibrary(
		"int classify(int x) { if (x > 10) return 2; if (x > 0) return 1; return 0; }\n" +
		"void ANativeActivity_onCreate(void* a, void* b, int c) { return; }",
		{ exports: ["ANativeActivity_onCreate", "classify"], soname: "libmerkava.so" }
	);
	assert.ok(lib.bytes.length > 0, "empty .so");
	const dir = mkdtempSync(join(tmpdir(), "awtsmoos-libtest-"));
	const path = join(dir, "libmerkava.so");
	writeFileSync(path, lib.bytes);
	const syms = runTool("/usr/bin/objdump", ["-T", path]);
	assert.ok(syms.output.includes("classify"), "classify missing from .dynsym");
});

test("library: globals land in the data section", () => {
	const lib = compilePortableCLibrary(
		"int counter = 0;\n" +
		"void ANativeActivity_onCreate(void* a, void* b, int c) { counter = 42; return; }",
		{ exports: ["ANativeActivity_onCreate"], soname: "libmerkava.so" }
	);
	assert.ok(lib.bytes.length > 0, "empty .so");
	// Data section present: linked evidence reports data length
	assert.ok(lib.linker.dataLength > 0, "data section empty despite global");
});
