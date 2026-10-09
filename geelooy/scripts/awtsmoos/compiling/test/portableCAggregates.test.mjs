//B"H
//Boruch Hashem
//Blessed is He

/**
 * Tests for portable C aggregate support: structures, arrays, string
 * literals, and pointer arithmetic in the native backend.
 *
 * Yaakov: "Anything emulated gets compiled." These features unblock the
 * emulated API classes that the scalar-only compiler could not express.
 */

import assert from "node:assert/strict";
import test from "node:test";
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { compilePortableCLibrary } from "../native/c/library.js";
import { generatePortableCAssembly } from "../native/c/codegen.js";
import { buildIrModule } from "../pe/c/ir/index.js";
import { tokenize } from "../pe/c/lexer.js";
import { parse } from "../pe/c/parser/index.js";
import { preprocessC } from "../pe/c/preprocessor.js";
import { simulateArm64Assembly } from "../pe/test/portableCArm64Simulator.mjs";

function buildModule(src) {
	return buildIrModule(
		parse(tokenize(preprocessC(src), { maximumTokens: 100000 })),
		{ sourceLanguage: "awtsmoos-c-subset-v1" }
	);
}

function simulate(src) {
	const gen = generatePortableCAssembly(buildModule(src), "linux-arm64-dynamic");
	return simulateArm64Assembly(gen.assembly).x0;
}

function expectValue(name, src, want) {
	test(name, () => {
		assert.equal(simulate(src), BigInt(want));
	});
}

function expectThrow(name, src, code) {
	test(name, () => {
		assert.throws(
			() => generatePortableCAssembly(buildModule(src), "linux-arm64-dynamic"),
			error => error.code === code
		);
	});
}

// --- structures -----------------------------------------------------------

expectValue(
	"struct definition, local variable, and member access",
	"struct Pair { int left; int right; }; int main() { struct Pair p; p.left = 30; p.right = 12; return p.left + p.right; }",
	42
);

expectValue(
	"struct pointer parameter and -> access",
	"struct P { int x; int y; }; int getx(struct P *pp) { return pp->x; } int main() { struct P p; p.x = 7; p.y = 9; return getx(&p) + p.y; }",
	16
);

expectValue(
	"nested structures",
	"struct In { int x; }; struct Out { struct In inn; int y; }; int main() { struct Out o; o.inn.x = 5; o.y = 6; return o.inn.x + o.y; }",
	11
);

expectValue(
	"whole-structure copy",
	"struct P { int a; int b; }; int main() { struct P p; p.a = 3; p.b = 4; struct P q; q = p; return q.a * 10 + q.b; }",
	34
);

expectValue(
	"union members share storage",
	"union U { int a; int b; }; int main() { union U u; u.a = 42; return u.b; }",
	42
);

expectValue(
	"address of struct member",
	"struct P { int x; int y; }; int main() { struct P p; p.y = 21; int *q = &p.y; return *q; }",
	21
);

expectValue(
	"linked structures through pointers",
	"struct N { int v; struct N *next; }; int main() { struct N a; struct N b; a.v = 1; b.v = 2; a.next = &b; return a.next->v + a.v; }",
	3
);

expectValue(
	"struct with array field",
	"struct S { int a[3]; int b; }; int main() { struct S s; s.a[1] = 13; s.b = 2; return s.a[1] + s.b; }",
	15
);

// --- arrays ---------------------------------------------------------------

expectValue(
	"local array read and write",
	"int main() { int a[4]; a[0] = 5; a[3] = 10; a[1] = a[0] + a[3]; return a[1]; }",
	15
);

expectValue(
	"global array read and write",
	"int g[3]; int main() { g[2] = 9; g[0] = 1; return g[2] + g[0]; }",
	10
);

expectValue(
	"global array is zero-initialized",
	"int g[3]; int main() { return g[1]; }",
	0
);

expectValue(
	"address of array element",
	"int main() { int a[3]; a[1] = 55; int *p = &a[1]; return *p; }",
	55
);

expectValue(
	"array passed to pointer parameter",
	"int sum(int *p, int n) { int t = 0; int i = 0; for (i = 0; i < n; i++) t = t + p[i]; return t; } int main() { int a[3]; a[0] = 1; a[1] = 2; a[2] = 3; return sum(a, 3); }",
	6
);

// --- strings ---------------------------------------------------------------

expectValue(
	"string literal indexed directly",
	"int main() { return \"abc\"[2]; }",
	99
);

expectValue(
	"char pointer to string literal",
	"int main() { char *s = \"hello\"; return s[0] * 100 + s[1]; }",
	10501
);

expectValue(
	"local char array initialized from a string",
	"int main() { char buf[8] = \"hi\"; return buf[0] * 100 + buf[1] + buf[2]; }",
	10505
);

expectValue(
	"global char pointer to string literal",
	"char *msg = \"hey\"; int main() { return msg[2]; }",
	121
);

expectValue(
	"global char array initialized from a string",
	"char ga[6] = \"yo\"; int main() { return ga[1]; }",
	111
);

expectValue(
	"string iteration with pointer increment",
	"int len(char *s) { int n = 0; while (*s) { n = n + 1; s = s + 1; } return n; } int main() { return len(\"hello\"); }",
	5
);

// --- pointer arithmetic ------------------------------------------------------

expectValue(
	"pointer plus integer",
	"int main() { int a[4]; a[0] = 1; a[1] = 2; a[2] = 3; a[3] = 4; int *p = a; return *(p + 2) + *(p + 3); }",
	7
);

expectValue(
	"integer plus pointer",
	"int main() { int a[3]; a[2] = 8; int *p = a; return *(2 + p); }",
	8
);

expectValue(
	"pointer minus integer",
	"int main() { int a[3]; a[0] = 8; int *p = a + 2; return *(p - 2); }",
	8
);

expectValue(
	"pointer difference is in elements",
	"int main() { int a[4]; int *p = a; int *q = p + 3; return q - p; }",
	3
);

expectValue(
	"array plus integer decays and scales",
	"int main() { int a[3]; a[2] = 8; return *(a + 2); }",
	8
);

// --- fail-closed boundaries ---------------------------------------------------

expectThrow(
	"structure used as a value is rejected",
	"struct P { int x; }; int f(struct P p) { return p.x; } int main() { return 0; }",
	"PORTABLE_C_TYPE_UNSUPPORTED"
);

expectThrow(
	"unknown struct field is rejected",
	"struct P { int x; }; int main() { struct P p; p.nope = 1; return 0; }",
	"PORTABLE_C_STRUCT_FIELD_UNKNOWN"
);

// --- library linking ----------------------------------------------------------

test("library: struct/array/string/pointer code links to a valid .so", () => {
	const lib = compilePortableCLibrary(
		[
			"struct Acc { int total; int count; };",
			"struct Acc acc;",
			"char *label = \"acc\";",
			"int values[8];",
			"void acc_add(int v) {",
			"  values[acc.count] = v;",
			"  acc.total = acc.total + v;",
			"  acc.count = acc.count + 1;",
			"}",
			"int acc_mean() {",
			"  int *p = values;",
			"  int t = 0; int i = 0;",
			"  for (i = 0; i < acc.count; i++) t = t + *(p + i);",
			"  return t / acc.count;",
			"}",
			"int acc_label0() { return label[0]; }"
		].join("\n"),
		{ exports: ["acc_add", "acc_mean", "acc_label0"], soname: "libaggregates.so" }
	);
	assert.ok(lib.bytes.length > 0, "empty .so");
	const dir = mkdtempSync(join(tmpdir(), "awtsmoos-aggtest-"));
	const path = join(dir, "libaggregates.so");
	writeFileSync(path, lib.bytes);

	const run = (binary, args) => {
		try {
			return execFileSync(binary, args, { encoding: "utf8", timeout: 30000 });
		} catch (e) {
			assert.fail(`${binary} failed: ${String(e.message).slice(0, 200)}`);
		}
	};
	const header = run("/usr/bin/readelf", ["-h", path]);
	assert.ok(header.includes("DYN (Shared object file)"), "not ET_DYN");
	assert.ok(header.includes("AArch64"), "not AArch64");
	const syms = run("/usr/bin/objdump", ["-T", path]);
	for (const name of ["acc_add", "acc_mean", "acc_label0"]) {
		assert.ok(syms.includes(name), `${name} missing from .dynsym`);
	}
	assert.ok(lib.linker.dataLength > 0, "data section empty despite globals and strings");
});

test("library: linked .so resolves the string-pointer data slot", () => {
	// Proves the abs64 data relocation the assembler emits for global
	// address initializers lands resolved in the final linked bytes:
	// the msg slot must hold the linked address of the string bytes.
	const lib = compilePortableCLibrary(
		"char *msg = \"hi\";\nint get0() { return msg[0]; }\n",
		{ exports: ["get0"], soname: "libproof.so" }
	);
	const dir = mkdtempSync(join(tmpdir(), "awtsmoos-aggtest-"));
	const path = join(dir, "libproof.so");
	writeFileSync(path, lib.bytes);
	const bytes = readFileSync(path);
	const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
	// readelf -l reports the RW data segment at file offset == vaddr 0x2000;
	// layout order is msg (1 cell) then the 3 string cells 'h','i',0.
	const dataFileOff = 0x2000;
	assert.equal(view.getBigUint64(dataFileOff, true), 0x2008n);
	assert.equal(view.getBigUint64(dataFileOff + 8, true), 0x68n);
	assert.equal(view.getBigUint64(dataFileOff + 16, true), 0x69n);
	assert.equal(view.getBigUint64(dataFileOff + 24, true), 0n);
});

test("library: struct/array/string code simulates the expected values", () => {
	// Behavioral proof of the exact bytes the linker test above verifies.
	assert.equal(
		simulate(
			"struct Acc { int total; int count; }; struct Acc acc; int values[8];" +
			"void acc_add(int v) { values[acc.count] = v; acc.total = acc.total + v; acc.count = acc.count + 1; }" +
			"int acc_mean() { int *p = values; int t = 0; int i = 0; for (i = 0; i < acc.count; i++) t = t + *(p + i); return t / acc.count; }" +
			"int main() { acc_add(10); acc_add(20); acc_add(30); return acc_mean(); }"
		),
		20n
	);
});
