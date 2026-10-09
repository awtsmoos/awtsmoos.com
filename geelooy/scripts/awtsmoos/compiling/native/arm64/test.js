/*
B"H
Boruch Hashem
Biezrash Hashem
*/
/**
 * ARM64 emitter tests: every implemented instruction is checked against a
 * known-good AArch64 encoding. Run: node test.js (exit 0 = all pass).
 */
import * as E from "./encoder.js";
import { assembleArm64 } from "./index.js";

let passed = 0;
let failed = 0;
const failures = [];

function hex(w) {
	return "0x" + (w >>> 0).toString(16).padStart(8, "0");
}

function check(name, actual, expected) {
	actual = actual >>> 0;
	expected = expected >>> 0;
	if (actual === expected) {
		passed++;
	} else {
		failed++;
		failures.push(`${name}: got ${hex(actual)}, want ${hex(expected)}`);
	}
}

function checkBytes(name, bytes, words) {
	if (bytes.length !== words.length * 4) {
		failed++;
		failures.push(`${name}: byte length ${bytes.length} != ${words.length * 4}`);
		return;
	}
	for (let i = 0; i < words.length; i++) {
		const w = bytes[i * 4] | (bytes[i * 4 + 1] << 8) | (bytes[i * 4 + 2] << 16) | (bytes[i * 4 + 3] << 24);
		check(`${name}[${i}]`, w, words[i]);
	}
}

function checkWords(name, src, words) {
	const got = asmWords(src);
	if (got.length !== words.length) {
		failed++;
		failures.push(`${name}: got ${got.length} words, want ${words.length}`);
		return;
	}
	for (let i = 0; i < words.length; i++) check(`${name}[${i}]`, got[i], words[i]);
}

function asmWords(src) {
	const { bytes } = assembleArm64(src);
	const words = [];
	for (let i = 0; i < bytes.length; i += 4) {
		words.push((bytes[i] | (bytes[i + 1] << 8) | (bytes[i + 2] << 16) | (bytes[i + 3] << 24)) >>> 0);
	}
	return words;
}

// --- Data movement (encoder) ---
check("movz x0, #0", E.movz(0, 0, 0, 64), 0xD2800000);
check("movz x1, #0x1234", E.movz(1, 0x1234, 0, 64), 0xD2824681);
check("movz x0, #0xffff, lsl #48", E.movz(0, 0xFFFF, 3, 64), 0xD2FFFFE0);
check("movz w5, #7", E.movz(5, 7, 0, 32), 0x528000E5);
check("movk x0, #1, lsl #16", E.movk(0, 1, 1, 64), 0xF2A00020);
check("movk w3, #0xabcd, lsl #16", E.movk(3, 0xABCD, 1, 32), 0x72B579A3);
check("movn x0, #0", E.movn(0, 0, 0, 64), 0x92800000);
check("mov x0, x1", E.movReg(0, 1, 64), 0xAA0103E0);
check("mov w2, w3", E.movReg(2, 3, 32), 0x2A0303E2);
check("adr x0, #0", E.adr(0, 0), 0x10000000);
check("adr x5, #4", E.adr(5, 4), 0x10000025);
check("adr x0, #-4", E.adr(0, -4), 0x10FFFFE0);
check("adrp x0, #0", E.adrp(0, 0), 0x90000000);
check("adrp x2, page+1", E.adrp(2, 1), 0xB0000002);

// --- Arithmetic (encoder) ---
check("add x0, x1, #5", E.addImm(0, 1, 5, 0, 64), 0x91001420);
check("add x0, x1, #1, lsl #12", E.addImm(0, 1, 1, 1, 64), 0x91400420);
check("add w0, w1, #5", E.addImm(0, 1, 5, 0, 32), 0x11001420);
check("add x0, x1, x2", E.addReg(0, 1, 2, 0, 0, 64), 0x8B020020);
check("add x0, x1, x2, lsl #3", E.addReg(0, 1, 2, 0, 3, 64), 0x8B020C20);
check("sub sp, sp, #16", E.subImm(31, 31, 16, 0, 64), 0xD10043FF);
check("sub x0, x1, x2", E.subReg(0, 1, 2, 0, 0, 64), 0xCB020020);
check("sub w0, w1, w2, lsr #1", E.subReg(0, 1, 2, 1, 1, 32), 0x4B420420);
check("adds x0, x1, #1", E.addsImm(0, 1, 1, 0, 64), 0xB1000420);
check("subs x0, x0, #1", E.subsImm(0, 0, 1, 0, 64), 0xF1000400);
check("mul x0, x1, x2", E.mul(0, 1, 2, 64), 0x9B027C20);
check("mul w0, w1, w2", E.mul(0, 1, 2, 32), 0x1B027C20);
check("madd x0, x1, x2, x3", E.madd(0, 1, 2, 3, 64), 0x9B020C20);
check("sdiv x0, x1, x2", E.sdiv(0, 1, 2, 64), 0x9AC20C20);
check("udiv x0, x1, x2", E.udiv(0, 1, 2, 64), 0x9AC20820);
check("sdiv w0, w1, w2", E.sdiv(0, 1, 2, 32), 0x1AC20C20);
check("neg x0, x1", E.neg(0, 1, 0, 0, 64), 0xCB0103E0);

// --- Logical (encoder) ---
check("and x0, x1, x2", E.andReg(0, 1, 2, 0, 0, 64), 0x8A020020);
check("orr x0, x1, x2", E.orrReg(0, 1, 2, 0, 0, 64), 0xAA020020);
check("eor x0, x1, x2", E.eorReg(0, 1, 2, 0, 0, 64), 0xCA020020);
check("eor x0, x1, x2, lsl #1", E.eorReg(0, 1, 2, 0, 1, 64), 0xCA020420);
check("orr w0, w1, w2, ror #3", E.orrReg(0, 1, 2, 3, 3, 32), 0x2AC20C20);
check("and x0, x1, #1", E.andImm(0, 1, 1, 64), 0x92400020);
check("orr x0, x1, #0xff", E.orrImm(0, 1, 0xFF, 64), 0xB2401C20);
check("eor x0, x1, #0x5555555555555555", E.eorImm(0, 1, 0x5555555555555555n, 64), 0xD2000820);
check("and w0, w1, #0xff", E.andImm(0, 1, 0xFF, 32), 0x12009C20);
check("lsl x0, x1, #3", E.lsl(0, 1, 3, 64), 0xD37DF020);
check("lsr x0, x1, #3", E.lsr(0, 1, 3, 64), 0xD343FC20);
check("asr x0, x1, #3", E.asr(0, 1, 3, 64), 0x9343FC20);
check("lsl w0, w1, #3", E.lsl(0, 1, 3, 32), 0x531D7020);
check("lsr w0, w1, #3", E.lsr(0, 1, 3, 32), 0x53037C20);
check("asr w0, w1, #3", E.asr(0, 1, 3, 32), 0x13037C20);

// --- Comparison (encoder) ---
check("cmp x0, #5", E.cmpImm(0, 5, 0, 64), 0xF100141F);
check("cmp x0, x1", E.cmpReg(0, 1, 0, 0, 64), 0xEB01001F);
check("cmp w0, w1", E.cmpReg(0, 1, 0, 0, 32), 0x6B01001F);
check("cmn x0, #5", E.cmnImm(0, 5, 0, 64), 0xB100141F);
check("cmn x0, x1", E.cmnReg(0, 1, 0, 0, 64), 0xAB01001F);
check("tst x0, x1", E.tstReg(0, 1, 0, 0, 64), 0xEA01001F);
check("tst x0, #0xff", E.tstImm(0, 0xFF, 64), 0xF2401C1F);

// --- Memory (encoder) ---
check("ldr x0, [x1, #8]", E.ldrImm(0, 1, 8, 64), 0xF9400420);
check("str x0, [x1, #8]", E.strImm(0, 1, 8, 64), 0xF9000420);
check("ldr x0, [x1]", E.ldrImm(0, 1, 0, 64), 0xF9400020);
check("ldr w0, [x1, #8]", E.ldrImm(0, 1, 8, 32), 0xB9400820);
check("str w2, [x3, #12]", E.strImm(2, 3, 12, 32), 0xB9000C62);
check("stp x29, x30, [sp, #-16]!", E.stp(29, 30, 31, -16, 64, "pre"), 0xA9BF7BFD);
check("ldp x29, x30, [sp], #16", E.ldp(29, 30, 31, 16, 64, "post"), 0xA8C17BFD);
check("stp x0, x1, [sp, #16]", E.stp(0, 1, 31, 16, 64, "offset"), 0xA90107E0);
check("ldp x0, x1, [sp, #16]", E.ldp(0, 1, 31, 16, 64, "offset"), 0xA94107E0);
check("ldp w0, w1, [sp, #8]", E.ldp(0, 1, 31, 8, 32, "offset"), 0x294107E0);
check("stp w0, w1, [sp, #8]", E.stp(0, 1, 31, 8, 32, "offset"), 0x290107E0);
check("ldr x0, [pc, #8]", E.ldrLiteral(0, 2, 64), 0x58000040);

// --- Control flow (encoder) ---
check("b #8", E.b(2), 0x14000002);
check("bl #0", E.bl(0), 0x94000000);
check("bl #-4", E.bl(-1), 0x97FFFFFF);
check("br x0", E.br(0), 0xD61F0000);
check("blr x5", E.blr(5), 0xD63F00A0);
check("ret", E.ret(), 0xD65F03C0);
check("ret x5", E.ret(5), 0xD65F00A0);
check("cbz x0, #8", E.cbz(0, 2, 64), 0xB4000040);
check("cbnz w1, #-4", E.cbnz(1, -1, 32), 0x35FFFFE1);
check("b.eq #0", E.bcond("eq", 0), 0x54000000);
check("b.ne #16", E.bcond("ne", 4), 0x54000081);

// --- System (encoder) ---
check("svc #0", E.svc(0), 0xD4000001);
check("svc #0x10", E.svc(0x10), 0xD4000201);
check("nop", E.nop(), 0xD503201F);

// --- Assembler: single instructions ---
function asm1(src, expected, name) {
	check(name || src, asmWords(src)[0], expected);
}
asm1("movz x0, #0", 0xD2800000);
asm1("movz x0, #0x1234, lsl #16", 0xD2A24680);
asm1("movk x5, #0xbeef, lsl #32", 0xF2D7DDE5);
asm1("mov x0, x1", 0xAA0103E0);
asm1("mov w7, wzr", 0x2A1F03E7);
checkBytes("mov x0, #0x12345678 expands", assembleArm64("mov x0, #0x12345678").bytes, [0xD28ACF00, 0xF2A24680]);
check("mov x0, #0x123456789abcdef0 expands to 4", asmWords("mov x0, #0x123456789abcdef0").length, 4);
check("mov x0, #-1 is movn", asmWords("mov x0, #-1")[0], 0x92800000);
asm1("adr x0, #16", 0x10000080);
asm1("add x0, x1, #5", 0x91001420);
asm1("add x0, x1, #0x1000", 0x91400420, "add auto lsl #12");
asm1("add x0, x1, x2, lsl #3", 0x8B020C20);
asm1("sub sp, sp, #16", 0xD10043FF);
asm1("subs x0, x0, #1", 0xF1000400);
asm1("mul x0, x1, x2", 0x9B027C20);
asm1("sdiv x0, x1, x2", 0x9AC20C20);
asm1("udiv x0, x1, x2", 0x9AC20820);
asm1("and x0, x1, x2", 0x8A020020);
asm1("orr x0, x1, #0xff", 0xB2401C20);
asm1("orr x0, x1, #0xFFFFFFFF00000000", 0xB2607C20, "64-bit bitmask");
asm1("eor x0, x1, x2", 0xCA020020);
asm1("lsl x0, x1, #3", 0xD37DF020);
asm1("lsr x2, x3, #10", 0xD34AFC62);
asm1("asr x0, x1, #63", 0x937FFC20);
asm1("cmp x0, #5", 0xF100141F);
asm1("cmp x0, x1", 0xEB01001F);
asm1("cmn x2, #0x1000", 0xB140045F, "cmn auto lsl #12");
asm1("tst x0, x1", 0xEA01001F);
asm1("ldr x0, [x1, #8]", 0xF9400420);
asm1("str x0, [sp, #16]", 0xF9000BE0);
asm1("stp x29, x30, [sp, #-16]!", 0xA9BF7BFD);
asm1("ldp x29, x30, [sp], #16", 0xA8C17BFD);
asm1("ldp w2, w3, [x4, #12]", 0x29418C82);
asm1("br x0", 0xD61F0000);
asm1("blr x16", 0xD63F0200);
asm1("ret", 0xD65F03C0);
asm1("svc #0", 0xD4000001);
asm1("nop", 0xD503201F);
asm1("; comment line\n// another\n  movz x0, #0  ; trailing", 0xD2800000, "comment handling");

// --- Assembler: labels and branches ---
checkWords("loop: subs/b.ne/ret", `
loop:
	subs x0, x0, #1
	b.ne loop
	ret
`, [0xF1000400, 0x54FFFFE1, 0xD65F03C0]);

checkWords("forward b/bl", `
	b target
	nop
target:
	bl target
`, [0x14000002, 0xD503201F, 0x94000000]);

checkWords("cbz/cbnz", `
	cbz x0, done
	cbnz w1, done
	nop
done:
	ret
`, [0xB4000060, 0x35000041, 0xD503201F, 0xD65F03C0]);

checkWords("adr to label", `
	adr x0, target
	nop
target:
	ret
`, [0x10000040, 0xD503201F, 0xD65F03C0]);

// adrp to a data label: code is 1 word (4 bytes), data starts at 4.
// adrp x0, msg -> page 0, offset 0
{
	const { bytes, symbols, relocations } = assembleArm64(`
	adrp x0, msg
	add x0, x0, :lo12:msg
.data
msg: "hi"
`);
	check("adrp x0, msg", (bytes[0] | (bytes[1] << 8) | (bytes[2] << 16) | (bytes[3] << 24)) >>> 0, 0x90000000);
	check("add x0, x0, :lo12:msg", (bytes[4] | (bytes[5] << 8) | (bytes[6] << 16) | (bytes[7] << 24)) >>> 0, 0x91002000);
	check("msg symbol offset", symbols.msg, 8);
	check("data bytes", bytes[8], 104); // 'h'
	check("data bytes", bytes[9], 105); // 'i'
	check("data bytes", bytes[10], 0);  // nul
	check("relocations", relocations.length, 2);
}

// ldr literal to a code label
checkWords("ldr literal", `
	ldr x0, target
	nop
target:
	ret
`, [0x58000040, 0xD503201F, 0xD65F03C0]);

// mov sp via add alias
check("mov sp, x0", asmWords("mov sp, x0")[0], 0x9100001F);
check("mov x0, sp", asmWords("mov x0, sp")[0], 0x910003E0);

// --- End-to-end: realistic function ---
checkWords("function with loop", `
	stp x29, x30, [sp, #-16]!
	mov x29, sp
	movz x0, #0
loop:
	add x0, x0, #1
	cmp x0, #10
	b.lt loop
	mov sp, x29
	ldp x29, x30, [sp], #16
	ret
`, [0xA9BF7BFD, 0x910003FD, 0xD2800000, 0x91000400, 0xF100281F,
    0x54FFFFCB, 0x910003BF, 0xA8C17BFD, 0xD65F03C0]);

// --- Error cases ---
function expectThrow(name, src) {
	try {
		assembleArm64(src);
		failed++;
		failures.push(`${name}: expected throw, assembled fine`);
	} catch (e) {
		passed++;
	}
}
expectThrow("bad mnemonic", "frob x0, x1");
expectThrow("bad register", "mov x32, x1");
expectThrow("imm12 overflow", "add x0, x1, #0x2001");
expectThrow("explicit lsl#12 with big imm", "add x0, x1, #0x1000, lsl #12");
expectThrow("unaligned ldr", "ldr x0, [x1, #3]");
expectThrow("undefined label", "b nowhere");
expectThrow("duplicate label", "a:\na:\nret");
expectThrow("width mismatch", "add x0, w1, #5");

// --- Report ---
console.log(`\nARM64 emitter: ${passed} passed, ${failed} failed`);
if (failures.length) {
	console.log("FAILURES:");
	for (const f of failures) console.log("  " + f);
	process.exit(1);
}
console.log("All ARM64 encoding tests pass. B\"H");
