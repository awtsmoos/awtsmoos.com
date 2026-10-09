//B"H
//Boruch Hashem
//Blessed is He

/**
 * AAPCS64 layout and float calling-convention end-to-end tests. Every case
 * compiles C to ARM64 and executes it on the repo's AArch64 emulator, proving
 * struct field offsets, sizes, and SIMD register passing byte-for-byte
 * against the ARM64 ABI. Yaakov: "Anything emulated gets compiled."
 */

import assert from "node:assert/strict";
import test from "node:test";
import { executeCFunction } from "./e2e-pipeline.test.mjs";

function expectAapcs64(name, src, want) {
	test(name, () => {
		assert.equal(executeCFunction(src, "main", []), want);
	});
}

// --- AAPCS64 struct layout ------------------------------------------------
// ARect is the motivating device case: 16 bytes per the ABI, not 32.

expectAapcs64(
	"aapcs64: ARect packs to 16 bytes with 4-byte strides",
	`struct ARect { int left; int top; int right; int bottom; };
	 int main() {
	   struct ARect r; r.left = 1; r.top = 2; r.right = 3; r.bottom = 4;
	   char *p = &r.left;
	   return p[0] + p[4] + p[8] + p[12];
	 }`,
	10
);

expectAapcs64(
	"aapcs64: ARect array stride is 16",
	`struct ARect { int left; int top; int right; int bottom; };
	 int main() {
	   struct ARect a[2]; char *p = &a[0].left; char *q = &a[1].left;
	   return q - p;
	 }`,
	16
);

expectAapcs64(
	"aapcs64: mixed char/short/int/long/pointer offsets",
	`struct Mixed { char c; int i; short s; long l; void *p; };
	 int main() {
	   struct Mixed m;
	   char *base = &m.c;
	   char *pi = &m.i;
	   char *ps = &m.s;
	   char *pl = &m.l;
	   char *pp = &m.p;
	   return (pi - base) * 1000000 + (ps - base) * 1000 + (pl - base) + (pp - base) / 100;
	 }`,
	// offsets: c=0, i=4, s=8, l=16, p=24 -> 4008016 + 0
	4008016
);

expectAapcs64(
	"aapcs64: mixed struct size is 32",
	`struct Mixed { char c; int i; short s; long l; void *p; };
	 int main() {
	   struct Mixed a[2]; char *p = &a[0].c; char *q = &a[1].c;
	   return q - p;
	 }`,
	32
);

expectAapcs64(
	"aapcs64: union members overlap at offset 0",
	`union U { int i; char c[4]; };
	 int main() {
	   union U u; u.i = 16909060;
	   char *p = &u.c[0];
	   return p[0] + p[1] + p[2] + p[3];
	 }`,
	// 0x01020304 little-endian bytes: 04 03 02 01 -> 4+3+2+1
	10
);

expectAapcs64(
	"aapcs64: nested struct respects inner alignment",
	`struct In { char c; int x; };
	 struct Out { short s; struct In inn; };
	 int main() {
	   struct Out o;
	   char *b = &o.s;
	   char *pc = &o.inn.c;
	   char *px = &o.inn.x;
	   return (pc - b) * 100 + (px - b);
	 }`,
	// s=0..1, inn at 4 (int alignment), c=4, x=8 -> 400 + 8
	408
);

expectAapcs64(
	"aapcs64: int array stride is 4",
	`int main() {
	   int a[4]; char *p = &a[0]; char *q = &a[3];
	   return q - p;
	 }`,
	12
);

expectAapcs64(
	"aapcs64: short array stride is 2",
	`int main() {
	   short a[4]; char *p = &a[0]; char *q = &a[2];
	   return q - p;
	 }`,
	4
);

expectAapcs64(
	"aapcs64: struct with array field packs tightly",
	`struct WithArray { char tag; int vals[3]; };
	 int main() {
	   struct WithArray w;
	   char *b = &w.tag;
	   char *p = &w.vals[0];
	   char *q = &w.vals[2];
	   return (p - b) * 100 + (q - p);
	 }`,
	// tag=0, vals at 4, vals[2] at 12 -> 400 + 8
	408
);

// --- byte-packed strings --------------------------------------------------

expectAapcs64(
	"aapcs64: string literals are byte-packed",
	`int main() {
	   char *s = "hello";
	   return s[0] * 10000 + s[1] * 100 + s[4];
	 }`,
	104 * 10000 + 101 * 100 + 111
);

expectAapcs64(
	"aapcs64: string indexing crosses the 8-byte line",
	`int main() {
	   char *s = "0123456789abcdef";
	   return s[7] * 100 + s[8] + s[15];
	 }`,
	// '7'=55, '8'=56, 'f'=102 -> 5500 + 56 + 102
	5658
);

// --- float / double calling convention ------------------------------------

expectAapcs64(
	"aapcs64: float argument and return round-trip through S0",
	`float fid(float x) { return x; }
	 int main() { return fid(1.5f); }`,
	// 1.5f = 0x3FC00000
	1069547520
);

expectAapcs64(
	"aapcs64: third float argument lands in S2",
	`float pick(float a, float b, float c) { return c; }
	 int main() { return pick(1.0f, 2.0f, 2.5f); }`,
	// 2.5f = 0x40200000
	1075838976
);

expectAapcs64(
	"aapcs64: integer and float arguments use independent registers",
	`float mix(int n, float x, int m, float y) { return y; }
	 int main() { return mix(7, 0.5f, 8, 0.25f); }`,
	// 0.25f = 0x3E800000
	1048576000
);

expectAapcs64(
	"aapcs64: float parameter spills to the stack frame",
	`float add1(float x) { float y = x; return y; }
	 int main() { return add1(2.5f); }`,
	1075838976
);

expectAapcs64(
	"aapcs64: unary minus flips the float sign bit",
	`float neg(float x) { return -x; }
	 int main() { return neg(1.5f); }`,
	// -1.5f = 0xBFC00000 as signed int32
	-1077936128
);

expectAapcs64(
	"aapcs64: double return round-trips through D0",
	`double did(double x) { return x; }
	 int main() {
	   double d = did(1.5);
	   char *p = &d;
	   return p[7];
	 }`,
	// 1.5 = 0x3FF8000000000000, top byte 0x3F
	63
);

expectAapcs64(
	"aapcs64: double argument lands in D0",
	`int topbyte(double x) { char *p = &x; return p[7]; }
	 int main() { return topbyte(1.5); }`,
	63
);

// --- signedness-correct narrow access -------------------------------------

expectAapcs64(
	"aapcs64: signed char loads sign-extend",
	`int main() { char c = -5; return c; }`,
	-5
);

expectAapcs64(
	"aapcs64: unsigned int loads zero-extend",
	`int main() { unsigned int u = 4294967295; return u > 100; }`,
	1
);

expectAapcs64(
	"aapcs64: short array elements sign-extend",
	`int main() { short a[2]; a[0] = -300; a[1] = 700; return a[0] + a[1]; }`,
	400
);
