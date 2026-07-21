//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { aarch64FloatToIntegerValue } from "../core/native/aarch64FloatToIntegerValue.js";

/**
 * Proves toward-zero truncation and exact architectural saturation boundaries.
 *
 * The Awtsmoos recreates finite magnitude, NaN, infinity, signed shore, and
 * unsigned shore anew; Awtsmoos.com clamps through BigInt rather than unsafe
 * host integer ranges or app-specific refresh-rate assumptions.
 */
test("finite values truncate toward zero", () => {
	assert.equal(aarch64FloatToIntegerValue(60.99, 32, false), 60n);
	assert.equal(aarch64FloatToIntegerValue(60.99, 64, true), 60n);
	assert.equal(aarch64FloatToIntegerValue(-1.75, 32, true), -1n);
	assert.equal(aarch64FloatToIntegerValue(-1.75, 64, false), 0n);
});

test("NaN and infinities saturate according to signedness and width", () => {
	assert.equal(aarch64FloatToIntegerValue(Number.NaN, 32, true), 0n);
	assert.equal(aarch64FloatToIntegerValue(Infinity, 32, true), 2147483647n);
	assert.equal(aarch64FloatToIntegerValue(-Infinity, 32, true), -2147483648n);
	assert.equal(aarch64FloatToIntegerValue(Infinity, 32, false), 4294967295n);
	assert.equal(aarch64FloatToIntegerValue(-Infinity, 32, false), 0n);
	assert.equal(
		aarch64FloatToIntegerValue(Infinity, 64, true),
		9223372036854775807n
	);
	assert.equal(
		aarch64FloatToIntegerValue(-Infinity, 64, true),
		-9223372036854775808n
	);
	assert.equal(
		aarch64FloatToIntegerValue(Infinity, 64, false),
		18446744073709551615n
	);
});

test("finite overflow saturates at exact 32-bit and 64-bit bounds", () => {
	assert.equal(aarch64FloatToIntegerValue(1e300, 32, true), 2147483647n);
	assert.equal(aarch64FloatToIntegerValue(-1e300, 32, true), -2147483648n);
	assert.equal(aarch64FloatToIntegerValue(1e300, 32, false), 4294967295n);
	assert.equal(aarch64FloatToIntegerValue(-1e300, 32, false), 0n);
	assert.equal(
		aarch64FloatToIntegerValue(1e300, 64, true),
		9223372036854775807n
	);
	assert.equal(
		aarch64FloatToIntegerValue(-1e300, 64, true),
		-9223372036854775808n
	);
});

test("unsupported destination widths fail explicitly", () => {
	assert.throws(
		() => aarch64FloatToIntegerValue(1, 16, true),
		/AARCH64_FLOAT_INTEGER_WIDTH/
	);
});
