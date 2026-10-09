//B"H — WASM GUI compiler self-test: parse, encode, validate, execute.
//Uses Node's built-in WebAssembly ONLY to verify the compiler's output bytes.

import { compileWasmGuiSource } from "./compiler.js";
import { encodeSigned32, encodeUnsigned } from "./leb128.js";
import { parseWasmGuiSource } from "./parser.js";

let failures = 0;
function check(name, condition, detail = "") {
	if (condition) {
		console.log(`  ok   ${name}`);
	} else {
		failures += 1;
		console.log(`  FAIL ${name}${detail ? ` — ${detail}` : ""}`);
	}
}

function decodeU(bytes) {
	let r = 0, s = 0;
	for (const b of bytes) { r |= (b & 0x7f) << s; if (!(b & 0x80)) break; s += 7; }
	return r >>> 0;
}
function decodeS(bytes) {
	let r = 0, s = 0, b = 0;
	for (b of bytes) { r |= (b & 0x7f) << s; s += 7; if (!(b & 0x80)) break; }
	if (s < 32 && (b & 0x40)) r |= (~0 << s);
	return r | 0;
}
function expectThrowCode(fn, code) {
	try { fn(); } catch (e) { return e.code === code; }
	return false;
}

// --- LEB128: spec vectors + round-trips ---
check("uleb128-spec-624485", JSON.stringify(encodeUnsigned(624485)) === "[229,142,38]");
check("sleb128-spec-64", JSON.stringify(encodeSigned32(64)) === "[192,0]");
check("sleb128-spec--65", JSON.stringify(encodeSigned32(-65)) === "[191,127]");
for (const v of [0, 1, 127, 128, 255, 624485, 0x7fffffff, 0xffffffff]) {
	check(`uleb128-roundtrip-${v}`, decodeU(encodeUnsigned(v)) === v);
}
for (const v of [0, 1, -1, 63, 64, -64, -65, 127, -128, 0x7fffffff, -0x80000000]) {
	check(`sleb128-roundtrip-${v}`, decodeS(encodeSigned32(v)) === v);
}
check("uleb128-rejects-negative", expectThrowCode(() => encodeUnsigned(-1), "WASM_ULEB128_RANGE"));
check("sleb128-rejects-overflow", expectThrowCode(() => encodeSigned32(0x80000000), "WASM_SLEB128_RANGE"));

// --- Parser: happy paths ---
check("parse-all-ops", parseWasmGuiSource('window "T" "S"; pixel 1 2 3; text "hi" 4 5; print 6; return 7;').length === 5);
check("parse-escaped-quote", parseWasmGuiSource('text "say \\"hi\\"" 0 0;')[0].arguments[0] === 'say "hi"');
check("parse-int32-edges",
	parseWasmGuiSource('return 2147483647;')[0].arguments[0] === 2147483647 &&
	parseWasmGuiSource('return -2147483648;')[0].arguments[0] === -2147483648);

// --- Parser: rejections ---
check("reject-int32-overflow", expectThrowCode(() => parseWasmGuiSource('return 2147483648;'), "WASM_INTEGER_RANGE"));
check("reject-float", expectThrowCode(() => parseWasmGuiSource('print 1.5;'), "WASM_INTEGER_RANGE"));
check("reject-unknown-op", expectThrowCode(() => parseWasmGuiSource('bogus 1;'), "WASM_STATEMENT_UNSUPPORTED"));
check("reject-unterminated-string", expectThrowCode(() => parseWasmGuiSource('print "oops;'), "WASM_STRING_UNTERMINATED"));
check("reject-empty-source", expectThrowCode(() => parseWasmGuiSource(''), "WASM_COMMAND_LIMIT"));
check("reject-257-commands", expectThrowCode(
	() => parseWasmGuiSource(Array(257).fill("print 1;").join(" ")), "WASM_COMMAND_LIMIT"));
check("reject-oversize-source", expectThrowCode(
	() => parseWasmGuiSource("print 1;".padEnd(64 * 1024 + 1, " ")), "WASM_SOURCE_LIMIT"));

// --- Compile + validate + execute against stub host ---
function readCString(memory, ptr) {
	const bytes = new Uint8Array(memory.buffer);
	let end = ptr;
	while (bytes[end] !== 0) end++;
	return new TextDecoder().decode(bytes.subarray(ptr, end));
}

async function runModule(source, label) {
	const result = compileWasmGuiSource(source, { name: label });
	const magicOk = result.bytes[0] === 0x00 && result.bytes[1] === 0x61 &&
		result.bytes[2] === 0x73 && result.bytes[3] === 0x6d;
	check(`${label}-magic`, magicOk);
	check(`${label}-validates`, WebAssembly.validate(result.bytes));
	const calls = [];
	const memory = new WebAssembly.Memory({ initial: 1, maximum: 4 });
	const { instance } = await WebAssembly.instantiate(result.bytes, {
		env: {
			memory,
			awtsmoos_open_window: (t, s) => calls.push(["open_window", t, s]),
			awtsmoos_draw_pixel: (x, y, c) => calls.push(["draw_pixel", x, y, c]),
			awtsmoos_draw_text: (p, x, y) => calls.push(["draw_text", p, x, y]),
			awtsmoos_print: (n) => calls.push(["print", n])
		}
	});
	const ret = instance.exports.main();
	return { calls, memory, ret, result };
}

const full = await runModule('window "Title" "Sub"; pixel 10 20 30; text "hi" 5 6; print 99; return 42;', "full");
check("full-call-order",
	JSON.stringify(full.calls.map(c => c[0])) === '["open_window","draw_pixel","draw_text","print"]',
	JSON.stringify(full.calls.map(c => c[0])));
check("full-pixel-args", full.calls[1][1] === 10 && full.calls[1][2] === 20 && full.calls[1][3] === 30);
check("full-print-arg", full.calls[3][1] === 99);
check("full-return", full.ret === 42, `got ${full.ret}`);
check("full-title", readCString(full.memory, full.calls[0][1]) === "Title");
check("full-subtitle", readCString(full.memory, full.calls[0][2]) === "Sub");
check("full-text", readCString(full.memory, full.calls[2][1]) === "hi" &&
	full.calls[2][2] === 5 && full.calls[2][3] === 6);

const dedup = await runModule('text "same" 0 0; text "same" 1 1; return 0;', "dedup");
check("dedup-shared-pointer", dedup.calls[0][1] === dedup.calls[1][1]);
check("dedup-string-count", dedup.result.stringCount === 1, `got ${dedup.result.stringCount}`);

const layout = await runModule('text "abc" 0 0; return 0;', "layout");
check("data-at-1024", layout.calls[0][1] >= 1024, `ptr=${layout.calls[0][1]}`);
check("nul-terminated", new Uint8Array(layout.memory.buffer)[layout.calls[0][1] + 3] === 0);

const defret = await runModule('print 5;', "defret");
check("default-return-0", defret.ret === 0, `got ${defret.ret}`);

const negret = await runModule('return -123;', "negret");
check("negative-return", negret.ret === -123, `got ${negret.ret}`);

const uni = await runModule('text "שלום עולם" 0 0; return 0;', "unicode");
check("unicode-roundtrip", readCString(uni.memory, uni.calls[0][1]) === "שלום עולם");

const max = await runModule(Array(256).fill("print 1;").join(" "), "max256");
check("max-256-commands", max.calls.length === 256, `got ${max.calls.length}`);

const meta = compileWasmGuiSource('print 1;', { name: "meta-check" });
check("meta-backend", meta.backend === "awtsmoos-wasm-gui-source-v1");
check("meta-format", meta.format === "webassembly" && meta.extension === ".wasm");
check("meta-command-count", meta.commandCount === 1);

if (failures) {
	console.log(`\n${failures} FAILURE(S)`);
	process.exit(1);
}
console.log("\nall wasm gui compiler checks passed");
