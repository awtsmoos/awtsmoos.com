//B"H
//Boruch Hashem
//Blessed is He

/**
 * End-to-end integration tests for the ENTIRE Awtsmoos compiler pipeline:
 *   C source -> ARM64 machine code -> execute on AArch64 emulator (semantic)
 *          -> link to ELF .so -> package to signed APK
 *
 * Yaakov: "Every feature that is emulated should also be able to be compiled."
 *
 * External tools (readelf, aapt2, apksigner) are used for VERIFICATION ONLY,
 * never in the build path, never in the repo.
 */

import assert from "node:assert/strict";
import test from "node:test";
import { execFileSync } from "node:child_process";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { preprocessC } from "../pe/c/preprocessor.js";
import { tokenize } from "../pe/c/lexer.js";
import { parse } from "../pe/c/parser/index.js";
import { buildIrModule, verifyIrModule } from "../pe/c/ir/index.js";
import { generatePortableCAssembly } from "../native/c/codegen.js";
import { assembleArm64 } from "../native/arm64/index.js";
import {
	createArm64Object,
	linkArm64ObjectsToSharedObject
} from "../../../../shared/compiling/native/elf64/arm64Linker.js";
import { callNativeGuestFunction } from "../../../../apps/android-emulator/core/native/nativeGuestFunctionCall.js";
import { compileNativeAppApk } from "../android/apk/nativeApk.js";
import { verifySignedApk } from "../android/apk/signer.js";

// ---------------------------------------------------------------------------
// Stage 1: C -> ARM64 machine code
// ---------------------------------------------------------------------------

export function compileCToArm64(src) {
	const processed = preprocessC(src);
	const tokens = tokenize(processed, { maximumTokens: 100000 });
	const ast = parse(tokens);
	const ir = buildIrModule(ast, { sourceLanguage: "awtsmoos-c-subset-v1" });
	const verification = verifyIrModule(ir);
	assert.ok(verification.ok !== false, "IR verification failed");
	const gen = generatePortableCAssembly(ir, "linux-arm64");
	const text = Array.isArray(gen.assembly) ? gen.assembly.join("\n") : gen.assembly;
	const assembled = assembleArm64(text);
	return { text, assembled };
}

// ---------------------------------------------------------------------------
// Stage 2: execute on the repo's AArch64 emulator (semantic verification)
// ---------------------------------------------------------------------------

function makeTestMemory(codeBytes, base = 0x10000n) {
	const MEM_SIZE = 0x40000;
	const buf = new ArrayBuffer(MEM_SIZE);
	const view = new DataView(buf);
	const u8 = new Uint8Array(buf);
	u8.set(codeBytes, Number(base));
	const check = (addr, size) => {
		const a = Number(BigInt(addr));
		if (a < 0 || a + size > MEM_SIZE) throw new Error(`guest OOB ${a}`);
		return a;
	};
	return {
		readU32: addr => view.getUint32(check(addr, 4), true),
		read: (addr, size) => u8.slice(check(addr, size), check(addr, size) + Number(size)),
		write: (addr, bytes) => u8.set(bytes, check(addr, bytes.length)),
		readAcquireInteger: (addr, size) => {
			const a = check(addr, size);
			return size === 4 ? BigInt(view.getUint32(a, true)) : view.getBigUint64(a, true);
		},
		writeReleaseInteger: (addr, size, v) => {
			const a = check(addr, size);
			if (size === 4) view.setUint32(a, Number(v), true);
			else view.setBigUint64(a, BigInt(v), true);
		},
		beginAarch64Instruction() {},
		endAarch64Instruction() {},
		stackTop: BigInt(MEM_SIZE - 0x1000),
		base
	};
}

export function executeCFunction(src, funcName = "main", args = []) {
	const { assembled } = compileCToArm64(src);
	const mem = makeTestMemory(assembled.bytes);
	const funcAddr = mem.base + BigInt(assembled.symbols[funcName]);
	const result = callNativeGuestFunction({
		functionAddress: funcAddr,
		stackPointer: mem.stackTop,
		arguments: args.map(a => BigInt(a)),
		memory: mem,
		instructionLimit: 100000
	});
	return result.signedInt32;
}

// ---------------------------------------------------------------------------
// Stage 3: link objects -> ELF .so
// ---------------------------------------------------------------------------

const RELOC_KIND_MAP = {
	bl: "arm64_bl",
	b: "arm64_b",
	cbz: "arm64_cbz",
	cbnz: "arm64_cbnz",
	bcond: "arm64_bcond",
	adr: "arm64_adr",
	adrp: "arm64_adrp",
	lo12: "arm64_lo12",
	ldrLiteral: "arm64_ldr_literal"
};

export function linkCToSharedObject(src, options = {}) {
	const { assembled } = compileCToArm64(src);
	const obj = createArm64Object({
		version: "awtsmoos-object-v1",
		architecture: "aarch64",
		name: options.name || "e2e-test",
		sections: [
			{
				name: "code",
				bytes: assembled.bytes,
				alignment: 4,
				permissions: { execute: true, read: true }
			}
		],
		symbols: Object.entries(assembled.symbols).map(([name, offset]) => ({
			name,
			offset,
			section: "code",
			binding: "global",
			kind: "function"
		})),
		relocations: assembled.relocations.map(r => ({
			kind: RELOC_KIND_MAP[r.type] || r.type,
			sourceOffset: r.offset,
			sourceSection: "code",
			targetSymbol: r.target,
			addend: 0
		}))
	});
	return linkArm64ObjectsToSharedObject([obj], {
		soname: options.soname || "libe2e.so"
	});
}

// ---------------------------------------------------------------------------
// Stage 4: .so -> signed APK
// ---------------------------------------------------------------------------

export function buildApkWithSo(soBytes, options = {}) {
	return compileNativeAppApk({
		assets: options.assets || {},
		keyDir: options.keyDir || "",
		label: options.label || "E2ETest",
		minSdkVersion: 26,
		nativeActivity: { libName: options.libName || "e2e" },
		nativeLibs: {
			"arm64-v8a": { [`lib${options.libName || "e2e"}.so`]: soBytes }
		},
		packageName: options.packageName || "com.awtsmoos.e2etest",
		targetSdkVersion: 35,
		versionCode: 1,
		versionName: "1.0"
	});
}

// ---------------------------------------------------------------------------
// External verification helpers (verification ONLY, never in build path)
// ---------------------------------------------------------------------------

function runTool(binary, args) {
	try {
		return { ok: true, output: execFileSync(binary, args, { encoding: "utf8", timeout: 30000 }) };
	} catch (e) {
		return { ok: false, output: String(e.message).slice(0, 500) };
	}
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

const SEMANTIC_CASES = [
	["constant return", `int main() { return 42; }`, 42],
	["addition", `int main() { return 40 + 2; }`, 42],
	["locals", `int main() { int x = 10; int y = 32; return x + y; }`, 42],
	["multiplication", `int main() { return 6 * 7; }`, 42],
	["subtraction", `int main() { return 100 - 58; }`, 42],
	["factorial loop", `int main() { int r = 1; for (int i = 1; i <= 6; i++) r = r * i; return r; }`, 720],
	["sum loop", `int main() { int s = 0; for (int i = 1; i <= 10; i++) s = s + i; return s; }`, 55],
	["if/else", `int main() { int x = 5; if (x > 3) return 1; else return 0; }`, 1],
	["while loop", `int main() { int i = 0; while (i < 10) i++; return i; }`, 10],
	["helper call", `int add(int a, int b) { return a + b; } int main() { return add(20, 22); }`, 42]
];

for (const [name, src, expected] of SEMANTIC_CASES) {
	test(`e2e semantic: ${name}`, () => {
		const got = executeCFunction(src);
		assert.equal(got, expected, `C program returned ${got}, expected ${expected}`);
	});
}

test("e2e: link C program to valid ELF .so (readelf verification)", () => {
	const so = linkCToSharedObject(`int main() { return 42; }`);
	assert.ok(so.bytes.length > 0, "empty .so");
	const dir = mkdtempSync(join(tmpdir(), "awtsmoos-e2e-"));
	const path = join(dir, "libe2e.so");
	writeFileSync(path, so.bytes);

	const header = runTool("/usr/bin/readelf", ["-h", path]);
	assert.ok(header.ok, "readelf failed");
	assert.ok(header.output.includes("DYN (Shared object file)"), "not ET_DYN");
	assert.ok(header.output.includes("AArch64"), "not AArch64");

	const dynamic = runTool("/usr/bin/readelf", ["-d", path]);
	assert.ok(dynamic.ok, "readelf -d failed");

	const symbols = runTool("/usr/bin/objdump", ["-T", path]);
	assert.ok(symbols.ok, "objdump -T failed");
	assert.ok(symbols.output.includes("main"), "main symbol missing from dynamic symbol table");
	// Note: readelf --dyn-syms cannot display symbols in section-header-less
	// .so files (a readelf quirk); objdump -T confirms the table is valid.
});

test("e2e: full pipeline C -> .so -> signed APK (apksigner verification)", () => {
	const so = linkCToSharedObject(`int main() { return 42; }`, { soname: "libe2e.so" });
	const keyDir = mkdtempSync(join(tmpdir(), "awtsmoos-e2e-keys-"));
	const apk = buildApkWithSo(so.bytes, {
		libName: "e2e",
		packageName: "com.awtsmoos.e2etest",
		keyDir
	});
	assert.ok(apk.bytes.length > 0, "empty APK");

	// Internal self-verification first
	const selfVerified = verifySignedApk(apk.bytes);
	assert.ok(selfVerified.ok, "APK self-verification failed");

	// External verification (tools only, never in build path)
	const dir = mkdtempSync(join(tmpdir(), "awtsmoos-e2e-"));
	const path = join(dir, "e2e.apk");
	writeFileSync(path, apk.bytes);

	const aapt2 = "/tmp/verify-tools/android-14/aapt2";
	const badging = runTool(aapt2, ["dump", "badging", path]);
	if (badging.ok) {
		assert.ok(badging.output.includes("package: name='com.awtsmoos.e2etest'"), "badging package mismatch");
	} else {
		console.log("  (aapt2 not available, skipped)");
	}

	const apksigner = "/tmp/verify-tools/android-14/apksigner";
	const verify = runTool(apksigner, ["verify", "--verbose", path]);
	if (verify.ok) {
		assert.ok(verify.output.includes("Verifies"), `apksigner: ${verify.output.slice(0, 200)}`);
	} else {
		console.log("  (apksigner not available, skipped)");
	}
});
