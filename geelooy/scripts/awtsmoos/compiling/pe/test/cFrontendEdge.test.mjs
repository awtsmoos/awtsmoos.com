//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { preprocessC } from "../c/preprocessor.js";
import { tokenize, TOKENS } from "../c/lexer.js";
import { parse } from "../c/parser/index.js";
import { buildIrModule, verifyIrModule } from "../c/ir/index.js";

/**
 * Edge-case witnesses for the Awtsmoos C frontend: the preprocessor never
 * rewrites inside literals or comments, macros rescan with recursion
 * protection, conditionals nest, and the parser accepts unions, enums,
 * typedefs, and qualifiers while every accepted form reaches verified IR.
 */

const pp = (source) => preprocessC(source);
const parseOk = (source) => parse(tokenize(preprocessC(source)));

test("preprocessor never expands inside string literals", () => {
	assert.equal(pp('#define x 42\nchar *s = "x";'), 'char *s = "x";');
	assert.equal(pp('#define AB 1\nchar *s = "AB CD";'), 'char *s = "AB CD";');
});

test("preprocessor never expands inside character literals or comments", () => {
	assert.equal(pp("#define x 42\nchar c = 'x';"), "char c = 'x';");
	assert.equal(pp("#define x 42\n// x is great"), "// x is great");
	assert.equal(pp("#define x 42\n/* x */ int q = x;"), "/* x */ int q = 42;");
});

test("object-like macros rescan with recursion protection", () => {
	assert.equal(pp("#define A B\n#define B 7\nint z = A;"), "int z = 7;");
	assert.equal(pp("#define A A\nint z = A;"), "int z = A;");
	assert.equal(pp("#define A B\n#define B A\nint z = A;"), "int z = A;");
	assert.equal(pp("#define X\n#ifdef X\nint a;\n#endif"), "int a;");
});

test("function-like macros expand arguments before substitution", () => {
	assert.equal(pp("#define F(a) ((a)+1)\nint y = F(5);"), "int y = ((5)+1);");
	assert.equal(pp("#define F(a) ((a)+1)\n#define G(b) F(b)\nint y = G(2*3);"), "int y = ((2*3)+1);");
	assert.equal(pp("#define F(a, b) a + b\nint y = F((1), (2, 3));"), "int y = (1) + (2, 3);");
	assert.equal(pp("#define F(a) a\nint y = F;"), "int y = F;");
});

test("variadic macros collect trailing arguments", () => {
	assert.equal(pp("#define L(f, ...) p(f, __VA_ARGS__)\nL(1, 2, 3);"), "p(1, 2, 3);");
	assert.equal(pp("#define L(f, ...) p(f, __VA_ARGS__)\nL(1);"), "p(1, );");
	assert.equal(pp("#define E(...) __VA_ARGS__\nE(a, b);"), "a, b;");
});

test("token pasting joins raw argument spellings", () => {
	assert.equal(pp("#define P(a,b) a ## b\nint P(m, v);"), "int mv;");
	assert.equal(pp("#define A B\n#define P(x) x ## 1\nint P(A);"), "int A1;");
	assert.equal(pp("#define MK(n) var_ ## n\nint MK(12);"), "int var_12;");
});

test("stringification quotes the raw argument", () => {
	assert.equal(pp("#define S(x) #x\nS(hello world);"), '"hello world";');
	assert.equal(pp("#define S(x) #x\nchar *s = S(a + b);"), 'char *s = "a + b";');
});

test("conditionals nest with elif and else", () => {
	assert.equal(pp("#if 1\nint a;\n#else\nint b;\n#endif"), "int a;");
	assert.equal(pp("#if 0\nint a;\n#elif 1\nint b;\n#else\nint c;\n#endif"), "int b;");
	assert.equal(pp("#if 1\n#if 0\nint a;\n#else\nint b;\n#endif\n#endif"), "int b;");
	assert.equal(pp("#if 0\nint gone;\n#endif\nint here;"), "int here;");
});

test("#ifdef, #ifndef, and defined() follow macro state", () => {
	assert.equal(pp("#define X\n#ifdef X\nint a;\n#endif"), "int a;");
	assert.equal(pp("#ifdef X\nint a;\n#endif\nint b;"), "int b;");
	assert.equal(pp("#ifndef X\nint a;\n#endif"), "int a;");
	assert.equal(pp("#define V 3\n#if defined(V) && V >= 3\nint c;\n#endif"), "int c;");
	assert.equal(pp("#if defined(NOPE) || 0\nint a;\n#endif\nint b;"), "int b;");
});

test("#if evaluates integer constant expressions", () => {
	assert.equal(pp("#if 1+2*3 == 7\nint a;\n#endif"), "int a;");
	assert.equal(pp("#if (1 << 4) == 16\nint a;\n#endif"), "int a;");
	assert.equal(pp("#if 0x10 == 16 && 010 == 8\nint a;\n#endif"), "int a;");
	assert.equal(pp("#if 'a' == 97\nint a;\n#endif"), "int a;");
	assert.equal(pp("#if UNDEFINED_THING\nint a;\n#endif\nint b;"), "int b;");
	assert.equal(pp("#define N 4\n#if N * 2 > 7\nint a;\n#endif"), "int a;");
});

test("line continuations splice before directive parsing", () => {
	assert.equal(pp("#define L hello \\\nworld\nint q = L;"), "int q = hello world;");
});

test("#error fails closed; #undef forgets; tolerated directives pass", () => {
	assert.throws(() => pp("#error boom"), /boom/);
	assert.equal(pp("#define X 1\n#undef X\n#ifdef X\nint a;\n#endif\nint b;"), "int b;");
	assert.equal(pp("#pragma once\nint q = 1;"), "int q = 1;");
	assert.equal(pp("#warning hush\nint q = 1;"), "int q = 1;");
	assert.throws(() => pp("#include <nope.h>"), /Unavailable C header/);
	assert.throws(() => pp("#frobnicate"), /Unsupported C preprocessor directive/);
	assert.throws(() => pp("#if 1\nint a;"), /stray|#endif/);
});

test("lexer decodes octal, long hex, and control escapes", () => {
	const [str] = tokenize('"\\101\\x41\\a\\b\\f\\v"');
	assert.equal(str.value, "A" + "A" + "\x07" + "\b" + "\f" + "\v");
	const [ch] = tokenize("'\\101'");
	assert.equal(ch.value, "65");
	const [ch2] = tokenize("'\\x42'");
	assert.equal(ch2.value, "66");
	const [kw] = tokenize("union");
	assert.equal(kw.type, TOKENS.KEYWORD);
	const [kw2] = tokenize("enum");
	assert.equal(kw2.type, TOKENS.KEYWORD);
	const [kw3] = tokenize("typedef");
	assert.equal(kw3.type, TOKENS.KEYWORD);
});

test("parser accepts top-level comma-separated globals", () => {
	const program = parseOk("int a, b = 5, c;\nint *p, q;\nint main() { return a + b + c + q; }");
	assert.deepEqual(program.globals.map(g => g.name), ["a", "b", "c", "p", "q"]);
	assert.equal(program.globals[1].value, "5");
	assert.equal(program.globals[3].type.ptr, 1);
	assert.equal(program.globals[4].type.ptr, 0);
});

test("parser accepts union definitions and union types", () => {
	const program = parseOk("union U { int x; char c[8]; };\nint main() { union U u; u.x = 1; return u.x; }");
	assert.equal(program.structs[0].union, true);
	assert.equal(program.structs[0].fields.length, 2);
	const plain = parseOk("struct S { int x; };\nint main() { return 0; }");
	assert.equal(plain.structs[0].union, undefined);
});

test("parser desugars enums to integer constants", () => {
	const program = parseOk("enum Color { RED, GREEN = 5, BLUE, NEG = -3, ALIAS = GREEN, TRAIL, };\nint main() { return BLUE; }");
	const values = Object.fromEntries(program.globals.map(g => [g.name, g.value]));
	assert.deepEqual(values, { RED: "0", GREEN: "5", BLUE: "6", NEG: "-3", ALIAS: "5", TRAIL: "6" });
	const typed = parseOk("enum E { A };\nenum E pick(enum E x) { return x; }\nint main() { return pick(A); }");
	assert.equal(typed.functions[0].args[0].type.base, "int");
});

test("parser resolves typedefs at top level and in blocks", () => {
	const program = parseOk("typedef int myint;\ntypedef char *str;\nmyint add(myint a, myint b) { return a + b; }\nint main() { str s; myint x = add(1, 2); return x; }");
	assert.equal(program.functions[0].retType.base, "int");
	assert.equal(program.functions[0].args[0].type.base, "int");
	const blocked = parseOk("int main() { typedef int myint; myint x = 3; return x; }");
	assert.equal(blocked.functions[0].body.stmts[0].varType.base, "int");
	const ptrAlias = parseOk("typedef int *intptr;\nint main() { intptr p; int x = 1; p = &x; return *p; }");
	assert.equal(ptrAlias.functions[0].body.stmts[0].varType.ptr, 1);
});

test("parser skips const and static qualifiers", () => {
	const program = parseOk("const int k = 5;\nstatic int s = 6;\nint main() { const int l = 7; static int m = 8; return k + s + l + m; }");
	assert.deepEqual(program.globals.map(g => g.name), ["k", "s"]);
	assert.equal(program.functions[0].body.stmts.length, 3);
});

test("every new frontend form reaches verified IR", () => {
	const sources = [
		"union U { int x; char c[4]; };\nint main() { union U u; u.x = 1; return u.x; }",
		"enum E { A, B = 3 };\nint main() { return A + B; }",
		"typedef int myint;\nmyint f(myint x) { return x; }\nint main() { return f(2); }",
		"#define TWICE(x) ((x) + (x))\nint main() { return TWICE(21); }",
		"#if 1\nint main() { return 7; }\n#endif",
		"const int k = 9;\nint main() { return k; }"
	];
	for (const source of sources) {
		const ast = parseOk(source);
		const ir = buildIrModule(ast, { sourceLanguage: "awtsmoos-c-subset-v1" });
		const verification = verifyIrModule(ir);
		assert.ok(!verification || verification.ok !== false, `IR rejected: ${source.slice(0, 40)}`);
	}
});
