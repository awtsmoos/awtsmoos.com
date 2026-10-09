// B"H — strings-v2 differential tests: native string codegen vs V8 (new Function).
//
// Every case compiles via the codegen-strings.js emitters, assembles with the
// self-hosted toolchain, runs the real binary, and compares against V8.
// Boolean cases: binary exits 0/1, V8 returns a boolean. String cases: binary
// writes UTF-8 to stdout, compared byte-exact against Buffer.from(v8, 'utf8').
//
// Run: node test/strings-v2.mjs [--bench]   (benchmarks are opt-in)
// Exit 0 = all green.

import * as S from "../codegen-strings.js";
import { compileNativeAsm } from "../../native/compiler.js";
import { createRequire } from "module";
import { writeFileSync, chmodSync, mkdirSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";
import { execFile } from "child_process";

const require = createRequire(import.meta.url);
const Parser = await require("../../../MerkavaASTParser/parser-core.js");

const WORK = join(tmpdir(), "merkava-strings-v2");
mkdirSync(WORK, { recursive: true });
let progSeq = 0;

let pass = 0, fail = 0;
const failures = [];
function ok(name, cond, extra) {
  if (cond) { pass++; }
  else { fail++; failures.push(name + (extra ? " :: " + extra : "")); console.log("FAIL:", name, extra || ""); }
}

// ---------------------------------------------------------------------------
// Test codegen context: tiny expr compiler over Literal/Identifier (+ named
// values). Stream 7 will supply the real expression compiler instead.
// ---------------------------------------------------------------------------
function newCx() {
  const gen = {
    lines: [], _n: 0,
    emit(s) { this.lines.push(s); },
    lbl(p) { return `$str_${p}_${this._n++}`; },
  };
  const named = new Map();
  const cx = S.makeStrCx(gen, (node) => testExpr(cx, node));
  cx.define = (name, thunk) => named.set(name, thunk);
  cx.named = named;
  return cx;
}
function testExpr(cx, node) {
  const g = cx.gen;
  switch (node.type) {
    case "Literal":
      if (typeof node.value === "string") { S.emitStringLit(cx, node); return; }
      if (typeof node.value === "number" && Number.isInteger(node.value)) {
        g.emit(`MOV RAX, ${BigInt(node.value) * 8n}`); return; // fixnum
      }
      throw new Error("test literal: " + JSON.stringify(node.value));
    case "Identifier": {
      const th = cx.named.get(node.name);
      if (!th) throw new Error("test: unknown name " + node.name);
      th(); return;
    }
    case "TemplateLiteral": S.emitTemplateLiteral(cx, node); return;
    default: throw new Error("test expr: unsupported " + node.type);
  }
}
const litStr = (raw) => ({ type: "Literal", value: raw }); // raw: escapes NOT decoded
const litInt = (v) => ({ type: "Literal", value: v });
const ident = (n) => ({ type: "Identifier", name: n });
function parseInit(src) {
  // 'var s = <expr>;' -> the init AST node (real parser: raw escapes)
  return new Parser(`var s = ${src};`).parse().body[0].declarations[0].init;
}

async function buildRun(cx, bodyLines, opts = {}) {
  const asm = S.buildTestProgram(cx, bodyLines);
  const out = await compileNativeAsm(asm, "linux-x64-static");
  const p = join(WORK, `t${process.pid}_${progSeq++}`);
  writeFileSync(p, Buffer.from(out.bytes));
  chmodSync(p, 0o755);
  return new Promise((res, rej) => execFile(p, {
    encoding: "buffer", maxBuffer: 256 * 1024 * 1024,
  }, (e, so) => {
    if (e && e.code === undefined) return rej(e);
    res({ code: e ? e.code : 0, out: Buffer.from(so) });
  }));
}

// Boolean case: native leaves RAX = 0/1 (untagged), V8 returns boolean.
async function boolCase(name, v8src, build) {
  const cx = newCx();
  const body = build(cx);
  const { code } = await buildRun(cx, body);
  const v8 = new Function(`return (${v8src});`)();
  ok(name, !!code === !!v8, `native=${code} v8=${v8}`);
}
// String case: native ends with RDI = string, CALL awts_str_write.
async function strCase(name, v8src, build) {
  const cx = newCx();
  const body = build(cx);
  body.push(`MOV RDI, RAX`, `CALL awts_str_write`, `XOR RAX, RAX`);
  const { out } = await buildRun(cx, body);
  const v8 = new Function(`return (${v8src});`)();
  const want = Buffer.from(String(v8), "utf8");
  ok(name, out.equals(want),
    `got ${out.toString("hex").slice(0, 80)} want ${want.toString("hex").slice(0, 80)}`);
}
// fixnum equality -> RAX = 0/1 for boolCase
function eqFixnum(cx, expectedInt) {
  cx.emit(`CMP RAX, ${BigInt(expectedInt) * 8n}`);
  cx.emit(`SETE AL`);
  cx.emit(`MOVZX RAX, AL`);
}
// 'rax' = value already in RAX (for emitters that take nodes)
function defRax(cx) { cx.define("rax", () => {}); }

// ---------------------------------------------------------------------------
// 0. Value-model conformance (Stream 1 proposal).
// ---------------------------------------------------------------------------
ok("model-source", S.valueModelSource() === "local-fallback" || S.valueModelSource() === "value-model.js");
ok("model-tags", S.TAG_FIXNUM === 0 && S.TAG_HEAPREF === 1 && S.HTYPE_STRING === 1);

// ---------------------------------------------------------------------------
// 1. Decoder unit tests (pure JS).
// ---------------------------------------------------------------------------
{
  const u = S.decodeJsStringUnits;
  const eq = (raw, want) => {
    const got = S.unitsToJsString(u(raw));
    ok(`decode ${JSON.stringify(raw)}`, got === want, `got ${JSON.stringify(got)}`);
  };
  eq("abc", "abc");
  eq("a\\nb\\tc\\\\d", "a\nb\tc\\d");
  eq("\\x41\\u0041", "AA");
  eq("\\u{1F600}", "\u{1F600}");
  eq("\\uD83D\\uDE00", "\u{1F600}");   // explicit pair -> astral
  eq("\\uD800", "\uD800");             // lone high kept
  eq("\\uDC00", "\uDC00");             // lone low kept
  eq("\\0", "\0");
  eq("\\'", "'");
  eq('a\\\nb', "ab");                  // line continuation
  eq("\\101", "A");                    // legacy octal
}

// ---------------------------------------------------------------------------
// 2. String literals (real parser nodes -> raw escapes -> native).
// ---------------------------------------------------------------------------
await strCase("lit-empty", `""`, (cx) => { testExpr(cx, parseInit(`""`)); return cx.gen.lines; });
await strCase("lit-ascii", `"hello"`, (cx) => { testExpr(cx, parseInit(`"hello"`)); return cx.gen.lines; });
await strCase("lit-escapes", `"a\\nb\\tc\\\\d\\"e\\'f\\0g\\x41h\\u0041i"`,
  (cx) => { testExpr(cx, parseInit(`"a\\nb\\tc\\\\d\\"e\\'f\\0g\\x41h\\u0041i"`)); return cx.gen.lines; });
await strCase("lit-astral", `"\\u{1F600}\\u{1D306}"`,
  (cx) => { testExpr(cx, parseInit(`"\\u{1F600}\\u{1D306}"`)); return cx.gen.lines; });
await strCase("lit-lone-surr", `"\\uD800x\\uDC00"`,
  (cx) => { testExpr(cx, parseInit(`"\\uD800x\\uDC00"`)); return cx.gen.lines; });
await strCase("lit-mixed", `"A\\u00E9\\u4E2D\\u{1F600}\\uD800Z"`,
  (cx) => { testExpr(cx, parseInit(`"A\\u00E9\\u4E2D\\u{1F600}\\uD800Z"`)); return cx.gen.lines; });
// identical literals share one heap object (cache) — behaviorally identical:
await strCase("lit-cache-dedup", `"ab"+"ab"`, (cx) => {
  testExpr(cx, litStr("ab")); cx.emit("PUSH RAX");
  testExpr(cx, litStr("ab")); cx.emit("MOV RSI, RAX"); cx.emit("POP RDI");
  cx.emit("CALL awts_str_concat"); return cx.gen.lines;
});

// ---------------------------------------------------------------------------
// 3. .length — incl. astral (2 units) and lone surrogates (1).
// ---------------------------------------------------------------------------
async function lenCase(name, v8src, rawLit, n) {
  await boolCase(name, v8src, (cx) => {
    defRax(cx);
    testExpr(cx, litStr(rawLit));
    S.emitLength(cx, ident("rax"));
    eqFixnum(cx, n);
    return cx.gen.lines;
  });
}
await lenCase("len-empty", `"".length === 0`, "", 0);
await lenCase("len-ascii", `"hello".length === 5`, "hello", 5);
await lenCase("len-astral", `"\u{1F600}".length === 2`, "\u{1F600}", 2);
await lenCase("len-astral-mixed", `"a\u{1F600}b".length === 4`, "a\u{1F600}b", 4);
await lenCase("len-lone", `"\uD800".length === 1`, "\uD800", 1);
await lenCase("len-long", `"abcdefghij".repeat(7).length === 70`, "abcdefghij".repeat(7), 70);

// ---------------------------------------------------------------------------
// 4. Concat: string+string, string+int, int+string, int+int, chains.
//    Non-literal operands force the runtime path (literal+literal folds).
// ---------------------------------------------------------------------------
function defStrVar(cx, name, raw) {
  // named value re-evaluating a cached literal (runtime value, not folded)
  cx.define(name, () => testExpr(cx, litStr(raw)));
}
async function catStr(name, v8src, lRaw, rRaw) {
  await strCase(name, v8src, (cx) => {
    defStrVar(cx, "a", lRaw); defStrVar(cx, "b", rRaw);
    S.emitConcat(cx, { type: "BinaryExpression", operator: "+", left: ident("a"), right: ident("b") });
    return cx.gen.lines;
  });
}
await catStr("cat-ss", `"foo"+"bar"`, "foo", "bar");
await catStr("cat-empty", `""+""`, "", "");
await catStr("cat-empty-l", `""+"abc"`, "", "abc");
await catStr("cat-empty-r", `"abc"+""`, "abc", "");
await catStr("cat-unicode", `"\\u00E9"+"\\u{1F600}"`, "é", "\u{1F600}");
await strCase("cat-folded", `"a"+"b"`, (cx) => { // compile-time fold
  S.emitConcat(cx, { type: "BinaryExpression", operator: "+", left: litStr("a"), right: litStr("b") });
  return cx.gen.lines;
});
async function catMixed(name, v8src, build) {
  await strCase(name, v8src, build);
}
await catMixed("cat-si", `"n="+42`, (cx) => {
  defStrVar(cx, "a", "n=");
  S.emitConcat(cx, { type: "BinaryExpression", operator: "+", left: ident("a"), right: litInt(42) });
  return cx.gen.lines;
});
await catMixed("cat-is", `7+"!"`, (cx) => {
  defStrVar(cx, "b", "!");
  S.emitConcat(cx, { type: "BinaryExpression", operator: "+", left: litInt(7), right: ident("b") });
  return cx.gen.lines;
});
await strCase("cat-chain3", `"x"+(-17)+"y"`, (cx) => {
  defStrVar(cx, "a", "x"); defStrVar(cx, "b", "y");
  testExpr(cx, ident("a")); cx.emit("PUSH RAX");
  testExpr(cx, litInt(-17)); cx.emit("MOV RSI, RAX"); cx.emit("POP RDI");
  cx.emit("CALL awts_str_concat"); cx.emit("PUSH RAX");
  testExpr(cx, ident("b")); cx.emit("MOV RSI, RAX"); cx.emit("POP RDI");
  cx.emit("CALL awts_str_concat");
  return cx.gen.lines;
});
await boolCase("cat-ii-int", `(1+2) === 3`, (cx) => {
  // both fixnum -> integer add through the same helper
  testExpr(cx, litInt(1)); cx.emit("PUSH RAX");
  testExpr(cx, litInt(2)); cx.emit("MOV RSI, RAX"); cx.emit("POP RDI");
  cx.emit("CALL awts_str_concat");
  eqFixnum(cx, 3);
  return cx.gen.lines;
});
// cons-node (rope) correctness: force a vine, then operate on it.
function buildVine(cx, times, chunkRaw) {
  // RBX = s, R12 = chunk, R14 = counter (all callee-saved; caller pushes/pops)
  testExpr(cx, litStr("")); cx.emit("MOV RBX, RAX");
  testExpr(cx, litStr(chunkRaw)); cx.emit("MOV R12, RAX");
  cx.emit("MOV R14, " + times);
  const top = cx.lbl("vine");
  cx.emit(top + ":");
  cx.emit("MOV RDI, RBX"); cx.emit("MOV RSI, R12");
  cx.emit("CALL awts_str_concat"); cx.emit("MOV RBX, RAX");
  cx.emit("DEC R14"); cx.emit(`JNZ ${top}`);
  cx.define("s", () => cx.emit("MOV RAX, RBX"));
}
await boolCase("vine-length", `"abcdefghij".repeat(20000).length === 200000`, (cx) => {
  defRax(cx);
  cx.emit("PUSH RBX"); cx.emit("PUSH R12"); cx.emit("PUSH R14");
  buildVine(cx, 20000, "abcdefghij");
  S.emitLength(cx, ident("s"));
  eqFixnum(cx, 200000);
  cx.emit("POP R14"); cx.emit("POP R12"); cx.emit("POP RBX");
  return cx.gen.lines;
});
await strCase("vine-content", `"abcdefghij".repeat(20000)`, (cx) => {
  cx.emit("PUSH RBX"); cx.emit("PUSH R12"); cx.emit("PUSH R14");
  buildVine(cx, 20000, "abcdefghij");
  testExpr(cx, ident("s"));
  cx.emit("POP R14"); cx.emit("POP R12"); cx.emit("POP RBX");
  return cx.gen.lines;
});

// ---------------------------------------------------------------------------
// 5. slice — incl. astral boundaries (must match V8 code-unit slicing).
// ---------------------------------------------------------------------------
async function sliceCase(name, v8src, sRaw, start, end) {
  await strCase(name, v8src, (cx) => {
    defStrVar(cx, "s", sRaw);
    S.emitSlice(cx, ident("s"), litInt(start), end === undefined ? null : litInt(end));
    return cx.gen.lines;
  });
}
await sliceCase("slice-basic", `"hello".slice(1,3)`, "hello", 1, 3);
await sliceCase("slice-neg", `"hello".slice(-3,-1)`, "hello", -3, -1);
await sliceCase("slice-toend", `"hello".slice(2)`, "hello", 2);
await sliceCase("slice-all", `"hello".slice()`, "hello", 0);
await sliceCase("slice-oob", `"hello".slice(10)`, "hello", 10);
await sliceCase("slice-inv", `"hello".slice(3,1)`, "hello", 3, 1);
await sliceCase("slice-clamp", `"hello".slice(-100,100)`, "hello", -100, 100);
await sliceCase("slice-empty", `"".slice(0,5)`, "", 0, 5);
await sliceCase("slice-astral", `"a\\u{1F600}b".slice(1,3)`, "a\u{1F600}b", 1, 3);
await sliceCase("slice-astral-hi", `"a\\u{1F600}b".slice(1,2)`, "a\u{1F600}b", 1, 2);
await sliceCase("slice-astral-lo", `"a\\u{1F600}b".slice(2,3)`, "a\u{1F600}b", 2, 3);
await sliceCase("slice-vine", `"abcdefghij".repeat(500).slice(123,456)`, "abcdefghij".repeat(500), 123, 456);

// ---------------------------------------------------------------------------
// 6. charAt / charCodeAt.
// ---------------------------------------------------------------------------
async function charAtCase(name, v8src, sRaw, idx) {
  await strCase(name, v8src, (cx) => {
    defStrVar(cx, "s", sRaw);
    S.emitCharAt(cx, ident("s"), litInt(idx));
    return cx.gen.lines;
  });
}
await charAtCase("charat-basic", `"hello".charAt(1)`, "hello", 1);
await charAtCase("charat-oob", `"hello".charAt(9)`, "hello", 9);
await charAtCase("charat-neg", `"hello".charAt(-1)`, "hello", -1);
await charAtCase("charat-astral-hi", `"\\u{1F600}".charAt(0)`, "\u{1F600}", 0);
await charAtCase("charat-astral-lo", `"\\u{1F600}".charAt(1)`, "\u{1F600}", 1);
await charAtCase("charat-empty", `"".charAt(0)`, "", 0);

async function charCodeAtCase(name, sRaw, idx, expected) {
  await boolCase(name, `true`, (cx) => {
    defStrVar(cx, "s", sRaw);
    S.emitCharCodeAt(cx, ident("s"), litInt(idx));
    eqFixnum(cx, expected);
    return cx.gen.lines;
  });
  // differential value check against V8 (except OOB: V8=NaN, we=-1 sentinel)
  const v8 = new Function(`return (${JSON.stringify(sRaw)}.charCodeAt(${idx}));`)();
  if (Number.isNaN(v8)) ok(name + "-v8isNaN", expected === S.CHARCODE_OOB);
  else ok(name + "-v8eq", v8 === expected, `v8=${v8}`);
}
await charCodeAtCase("cc-basic", "hello", 1, 101);
await charCodeAtCase("cc-zero", "A", 0, 65);
await charCodeAtCase("cc-astral-hi", "\u{1F600}", 0, 0xD83D);
await charCodeAtCase("cc-astral-lo", "\u{1F600}", 1, 0xDE00);
await charCodeAtCase("cc-lone", "\uD800", 0, 0xD800);
await charCodeAtCase("cc-oob", "hello", 9, S.CHARCODE_OOB);
await charCodeAtCase("cc-neg", "hello", -1, S.CHARCODE_OOB);

// ---------------------------------------------------------------------------
// 7. Comparisons — code-unit order, mixed lengths, cons vs flat.
// ---------------------------------------------------------------------------
async function cmpCase(name, v8src, lRaw, op, rRaw, runtime) {
  await boolCase(name, v8src, (cx) => {
    if (runtime) { defStrVar(cx, "a", lRaw); defStrVar(cx, "b", rRaw); }
    const L = runtime ? ident("a") : litStr(lRaw);
    const R = runtime ? ident("b") : litStr(rRaw);
    S.emitStrCmp(cx, L, op, R);
    return cx.gen.lines;
  });
}
await cmpCase("cmp-eq", `"abc" === "abc"`, "abc", "==", "abc");
await cmpCase("cmp-ne", `"abc" !== "abd"`, "abc", "!=", "abd");
await cmpCase("cmp-lt", `"a" < "b"`, "a", "<", "b");
await cmpCase("cmp-gt", `"b" > "a"`, "b", ">", "a");
await cmpCase("cmp-le", `"a" <= "a"`, "a", "<=", "a");
await cmpCase("cmp-ge", `"b" >= "a"`, "b", ">=", "a");
await cmpCase("cmp-prefix", `"ab" < "abc"`, "ab", "<", "abc");
await cmpCase("cmp-prefix2", `"abc" > "ab"`, "abc", ">", "ab");
await cmpCase("cmp-empty", `"" < "a"`, "", "<", "a");
await cmpCase("cmp-empty2", `"a" > ""`, "a", ">", "");
await cmpCase("cmp-empty-eq", `"" === ""`, "", "==", "");
await cmpCase("cmp-unicode", `"\\u00E9" > "z"`, "é", ">", "z");
await cmpCase("cmp-astral", `"\\u{1F600}" > "\\u{1F601}"`, "\u{1F600}", ">", "\u{1F601}");
// runtime (non-folded) paths incl. cons nodes: concat via idents, then compare.
async function cmpConcatVs(name, v8src, lRaw, rRaw, op, wantRaw) {
  await boolCase(name, v8src, (cx) => {
    defRax(cx);
    defStrVar(cx, "a", lRaw); defStrVar(cx, "b", rRaw);
    testExpr(cx, ident("a")); cx.emit("PUSH RAX");
    testExpr(cx, ident("b")); cx.emit("MOV RSI, RAX"); cx.emit("POP RDI");
    cx.emit("CALL awts_str_concat");
    S.emitStrCmp(cx, ident("rax"), op, litStr(wantRaw));
    return cx.gen.lines;
  });
}
await cmpConcatVs("cmp-rt-eq", `("fo"+"obar") === "foobar"`, "fo", "obar", "==", "foobar");
await cmpConcatVs("cmp-rt-lt", `("a"+"b") < "ac"`, "a", "b", "<", "ac");
await cmpConcatVs("cmp-cons", `("x".repeat(100)+"y") === ("x".repeat(100)+"y")`,
  "x".repeat(100), "y", "==", "x".repeat(100) + "y");

// ---------------------------------------------------------------------------
// 8. Template literals (real parser nodes).
// ---------------------------------------------------------------------------
await strCase("tpl-basic", "`x${42}y`", (cx) => {
  testExpr(cx, parseInit("`x${42}y`"));
  return cx.gen.lines;
});
await strCase("tpl-str", "`${s}!`".replace("s", `"hi"`), (cx) => {
  testExpr(cx, parseInit("`${\"hi\"}!`"));
  return cx.gen.lines;
});
await strCase("tpl-empty-expr", "`a${\"\"}b`", (cx) => {
  testExpr(cx, parseInit("`a${\"\"}b`"));
  return cx.gen.lines;
});
await strCase("tpl-neg", "`n=${-7}`", (cx) => {
  // -7 parses as UnaryExpression; emulate via ident bound to fixnum -7
  cx.define("neg7", () => cx.emit("MOV RAX, -56")); // fixnum(-7)
  const tpl = parseInit("`n=${neg7}`");
  testExpr(cx, tpl);
  return cx.gen.lines;
});
await strCase("tpl-multi", "`${\"a\"}${1}${\"b\"}${22}c`", (cx) => {
  testExpr(cx, parseInit("`${\"a\"}${1}${\"b\"}${22}c`"));
  return cx.gen.lines;
});
await strCase("tpl-unicode", "`\\u00E9${\"\\u{1F600}\"}`", (cx) => {
  testExpr(cx, parseInit("`\\u00E9${\"\\u{1F600}\"}`"));
  return cx.gen.lines;
});

// ---------------------------------------------------------------------------
// 9. String(int).
// ---------------------------------------------------------------------------
async function strIntCase(name, v) {
  await strCase(name, `String(${v})`, (cx) => {
    defRax(cx);
    testExpr(cx, litInt(v));
    S.emitIntToString(cx, ident("rax"));
    return cx.gen.lines;
  });
}
await strIntCase("strint-0", 0);
await strIntCase("strint-pos", 42);
await strIntCase("strint-neg", -17);
await strIntCase("strint-big", 123456789012345678);
await strIntCase("strint-bigneg", -999999999999999999);
// NOTE: |n| >= 2^53: V8 stores doubles (2^60-1 isn't a distinct double; it
// IS 2^60) and prints shortest-round-trip ("...847000"), while fixnum61 holds
// the EXACT integer and we render its exact decimal. Models differ there by
// construction; differential testing covers |n| < 2^53 (doubles exact).
await strIntCase("strint-max53", 9007199254740991);    // 2^53 - 1
await strIntCase("strint-min53", -9007199254740991);   // -(2^53 - 1)

// ---------------------------------------------------------------------------
// 10. Benchmarks (opt-in: node test/strings-v2.mjs --bench).
// ---------------------------------------------------------------------------
async function buildBenchCx() { return newCx(); }

async function timeNative(label, buildBody, reps) {
  // buildBody(cx, k) emits one kernel repetition; we time `reps` execs.
  const cx = await buildBenchCx();
  const body = buildBody(cx);
  const asm = S.buildTestProgram(cx, body);
  const t0 = Date.now();
  const out = await compileNativeAsm(asm, "linux-x64-static");
  const compileMs = Date.now() - t0;
  const p = join(WORK, `bench_${process.pid}`);
  writeFileSync(p, Buffer.from(out.bytes));
  chmodSync(p, 0o755);
  // spawn overhead calibration
  const { execFileSync } = await import("child_process");
  let spawnBest = Infinity;
  for (let i = 0; i < 5; i++) {
    const s0 = process.hrtime.bigint();
    execFileSync("/bin/true");
    spawnBest = Math.min(spawnBest, Number(process.hrtime.bigint() - s0) / 1e6);
  }
  // binary's exit code is the low byte of its integer result; ignore it.
  const runQ = () => { try { execFileSync(p, { stdio: "ignore" }); } catch (e) { /* exit code only */ } };
  for (let w = 0; w < 2; w++) runQ();
  let best = Infinity;
  for (let r = 0; r < reps; r++) {
    const s0 = process.hrtime.bigint();
    runQ();
    best = Math.min(best, Number(process.hrtime.bigint() - s0) / 1e6);
  }
  return { label, ms: Math.max(0.001, best - spawnBest), raw: best, spawn: spawnBest, compileMs };
}
function timeV8(label, fn, reps) {
  for (let w = 0; w < 3; w++) fn();
  let best = Infinity;
  for (let r = 0; r < reps; r++) {
    const s0 = process.hrtime.bigint(); fn();
    best = Math.min(best, Number(process.hrtime.bigint() - s0) / 1e6);
  }
  return { label, ms: best };
}
function reportBench(native, v8, unit) {
  const ratio = v8.ms / native.ms;
  const verdict = ratio >= 1 ? `NATIVE WINS ${ratio.toFixed(2)}x` : `v8 wins ${(1 / ratio).toFixed(2)}x`;
  console.log(`${native.label}: native=${native.ms.toFixed(2)}ms v8=${v8.ms.toFixed(2)}ms | ${verdict} ${unit || ""}| compile=${native.compileMs}ms`);
  return ratio;
}

async function runBenchmarks() {
  const { readFileSync } = await import("fs");
  const load = readFileSync("/proc/loadavg", "utf8").trim().split(" ")[0];
  console.log(`\n=== BENCHMARKS (load ${load}) ===`);
  const K = 10; // internal repeats per process to amortize spawn

  // B1: s += 'abcdefghij' x 20000  (the flagship)
  const catBody = (cx) => {
    const L = [];
    const e = (s) => L.push(s);
    e("PUSH RBX"); e("PUSH R12"); e("PUSH R13"); e("PUSH R14"); e("PUSH R15");
    testExpr(cx, litStr("")); e("MOV R14, RAX");
    testExpr(cx, litStr("abcdefghij")); e("MOV R12, RAX");
    e(`MOV R13, ${K}`);
    const outer = cx.lbl("catouter"), inner = cx.lbl("catinner");
    e(outer + ":");
    e("MOV RBX, R14");   // s = "" fresh each outer iteration (matches V8)
    e("MOV R15, 20000");
    e(inner + ":");
    e("MOV RDI, RBX"); e("MOV RSI, R12");
    e("CALL awts_str_concat"); e("MOV RBX, RAX");
    e("DEC R15"); e(`JNZ ${inner}`);
    e("DEC R13"); e(`JNZ ${outer}`);
    // return total length (O(1) on the vine) to keep the loop live
    e("MOV R10, RBX"); e("AND R10, -8");
    e("MOV RAX, QWORD PTR [R10]"); e("SAR RAX, 5");
    e("POP R15"); e("POP R14"); e("POP R13"); e("POP R12"); e("POP RBX");
    const pre = cx.gen.lines.splice(0);
    return [...pre, ...L];
  };
  const n1 = await timeNative("concat-20k", catBody, 5);
  const v8cat = new Function(`var s=""; for(var r=0;r<${K};r++){ s=""; for(var i=0;i<20000;i++){ s+="abcdefghij"; } } return s.length;`);
  const v1 = timeV8("concat-20k", v8cat, 7);
  const r1 = reportBench(n1, v1, `(${(n1.ms / K / 20000 * 1e6).toFixed(1)}ns/op native)`);
  void r1;

  // B2: slice microbench on a 200k vine (first slice flattens, rest are O(1)+copy)
  const sliceBody = (cx) => {
    const L = [];
    const e = (s) => L.push(s);
    e("PUSH RBX"); e("PUSH R12"); e("PUSH R13"); e("PUSH R14"); e("PUSH R15");
    testExpr(cx, litStr("")); e("MOV RBX, RAX");
    testExpr(cx, litStr("abcdefghij")); e("MOV R12, RAX");
    e("MOV R15, 20000");
    const bt = cx.lbl("sbuild");
    e(bt + ":");
    e("MOV RDI, RBX"); e("MOV RSI, R12");
    e("CALL awts_str_concat"); e("MOV RBX, RAX");
    e("DEC R15"); e(`JNZ ${bt}`);
    e("MOV RDI, RBX"); e("CALL awts_str_flatten"); e("MOV RBX, RAX"); // one-time
    e(`MOV R13, ${K}`);
    const outer = cx.lbl("souter"), inner = cx.lbl("sinner");
    e(outer + ":");
    e("XOR R14, R14");            // i = 0..19999
    e(inner + ":");
    e("MOV RDI, RBX");
    e("MOV RSI, R14"); e("SHL RSI, 3");        // start fixnum
    e("MOV RDX, R14"); e("ADD RDX, 10"); e("SHL RDX, 3"); // end fixnum
    e("CALL awts_str_slice");
    e("INC R14"); e("CMP R14, 20000"); e(`JL ${inner}`);
    e("DEC R13"); e(`JNZ ${outer}`);
    e("XOR RAX, RAX");
    e("POP R15"); e("POP R14"); e("POP R13"); e("POP R12"); e("POP RBX");
    const pre = cx.gen.lines.splice(0);
    return [...pre, ...L];
  };
  // B3: charCodeAt microbench
  const ccBody = (cx) => {
    const L = [];
    const e = (s) => L.push(s);
    e("PUSH RBX"); e("PUSH R12"); e("PUSH R13"); e("PUSH R14"); e("PUSH R15");
    testExpr(cx, litStr("")); e("MOV RBX, RAX");
    testExpr(cx, litStr("abcdefghij")); e("MOV R12, RAX");
    e("MOV R15, 20000");
    const bt = cx.lbl("cbuild");
    e(bt + ":");
    e("MOV RDI, RBX"); e("MOV RSI, R12");
    e("CALL awts_str_concat"); e("MOV RBX, RAX");
    e("DEC R15"); e(`JNZ ${bt}`);
    e("MOV RDI, RBX"); e("CALL awts_str_flatten"); e("MOV RBX, RAX");
    e(`MOV R13, ${K}`);
    const outer = cx.lbl("couter"), inner = cx.lbl("cinner");
    e(outer + ":");
    e("XOR R14, R14");       // sum (untagged)
    e("XOR R15, R15");       // i
    e(inner + ":");
    e("PUSH R15");
    e("MOV RDI, RBX");
    e("MOV RSI, R15"); e("SHL RSI, 3");
    e("CALL awts_str_char_code_at");
    e("SAR RAX, 3"); e("ADD R14, RAX");
    e("POP R15");
    e("INC R15"); e("CMP R15, 20000"); e(`JL ${inner}`);
    e("MOV RAX, R14"); e("SHL RAX, 3"); // return fixnum sum
    e("DEC R13"); e(`JNZ ${outer}`);
    e("POP R15"); e("POP R14"); e("POP R13"); e("POP R12"); e("POP RBX");
    const pre = cx.gen.lines.splice(0);
    return [...pre, ...L];
  };
  const n3 = await timeNative("charcodeat-20k", ccBody, 5);
  const v8cc = new Function(`var s=""; for(var i=0;i<20000;i++){s+="abcdefghij";} var c=0; for(var r=0;r<${K};r++){ c=0; for(var i=0;i<20000;i++){ c+=s.charCodeAt(i); } } return c;`);
  const v3 = timeV8("charcodeat-20k", v8cc, 7);
  // sanity: native binary must exit 0 (value correctness is proven by cc-* cases)
  reportBench(n3, v3, `(${(n3.ms / K / 20000 * 1e6).toFixed(1)}ns/op native)`);
}

// ---------------------------------------------------------------------------
const t0 = Date.now();
if (process.argv.includes("--bench")) await runBenchmarks();
console.log(`\nstrings-v2: ${pass} passed, ${fail} failed in ${((Date.now() - t0) / 1000).toFixed(1)}s`);
if (failures.length) { console.log("FAILURES:"); for (const f of failures) console.log(" -", f); process.exit(1); }
