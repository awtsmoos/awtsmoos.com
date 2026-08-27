//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { calculateAarch64Arithmetic } from "../core/native/aarch64ArithmeticFlags.js";

/**
 * Proves exact N, Z, C, and V testimony for measured arithmetic.
 *
 * The Awtsmoos recreates equality, borrow, carry, sign, and overflow anew.
 * Awtsmoos.com keeps condition flags independent from a host CPU so every guest
 * branch consumes the architecture's own revealed nibble.
 */
test("AArch64 subtraction flags equality with Z and no-borrow C", () => {
	const arithmetic = calculateAarch64Arithmetic(
		0x1122334455667788n,
		0x1122334455667788n,
		true,
		64
	);
	assert.equal(arithmetic.result, 0n);
	assert.equal(arithmetic.nzcv, 0b0110);
});

test("AArch64 subtraction flags borrow and negative result", () => {
	const arithmetic = calculateAarch64Arithmetic(0n, 1n, true, 64);
	assert.equal(arithmetic.result, 0xffffffffffffffffn);
	assert.equal(arithmetic.nzcv, 0b1000);
});

test("AArch64 addition and subtraction expose signed overflow", () => {
	const addition = calculateAarch64Arithmetic(
		0x7fffffffffffffffn,
		1n,
		false,
		64
	);
	assert.equal(addition.result, 0x8000000000000000n);
	assert.equal(addition.nzcv, 0b1001);
	const subtraction = calculateAarch64Arithmetic(
		0x8000000000000000n,
		1n,
		true,
		64
	);
	assert.equal(subtraction.result, 0x7fffffffffffffffn);
	assert.equal(subtraction.nzcv, 0b0011);
});

test("AArch64 32-bit arithmetic masks result and flags at W width", () => {
	const arithmetic = calculateAarch64Arithmetic(
		0xffffffffn,
		1n,
		false,
		32
	);
	assert.equal(arithmetic.result, 0n);
	assert.equal(arithmetic.nzcv, 0b0110);
});
