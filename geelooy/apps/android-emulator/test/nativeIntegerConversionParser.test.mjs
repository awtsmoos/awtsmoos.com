//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { parseNativeInteger } from "../core/native/nativeIntegerConversionParser.js";

test("decimal parsing preserves whitespace, sign, and end index", () => {
	const parsed = parseNativeInteger(" 	-123xyz", { base: 10, signed: true });
	assert.equal(parsed.value, -123n);
	assert.equal(parsed.guestValue, 0xffffffffffffff85n);
	assert.equal(parsed.endIndex, 6);
	assert.equal(parsed.digitCount, 3);
});

test("base inference and explicit radices follow C syntax", () => {
	for (const [text, base, value, end, effective] of [
		["0xff!", 0, 255n, 4, 16],
		["0779", 0, 63n, 3, 8],
		["1012", 2, 5n, 3, 2],
		["Zz", 36, 1295n, 2, 36],
		["0x10", 16, 16n, 4, 16]
	]) {
		const parsed = parseNativeInteger(text, { base, signed: true });
		assert.equal(parsed.value, value);
		assert.equal(parsed.endIndex, end);
		assert.equal(parsed.effectiveBase, effective);
	}
});

test("no digits and incomplete hexadecimal prefixes preserve C end rules", () => {
	const absent = parseNativeInteger("  -x", { base: 10, signed: true });
	assert.equal(absent.converted, false);
	assert.equal(absent.endIndex, 0);
	const incomplete = parseNativeInteger("0xg", { base: 0, signed: true });
	assert.equal(incomplete.converted, true);
	assert.equal(incomplete.value, 0n);
	assert.equal(incomplete.endIndex, 1);
});

test("signed sixty-four-bit limits clamp after consuming every digit", () => {
	const maximum = parseNativeInteger("9223372036854775807", { base: 10 });
	const minimum = parseNativeInteger("-9223372036854775808", { base: 10 });
	assert.equal(maximum.value, 9223372036854775807n);
	assert.equal(minimum.value, -9223372036854775808n);
	const high = parseNativeInteger("9223372036854775808123x", { base: 10 });
	const low = parseNativeInteger("-9223372036854775809123x", { base: 10 });
	assert.equal(high.value, 9223372036854775807n);
	assert.equal(low.value, -9223372036854775808n);
	assert.equal(high.overflow, true);
	assert.equal(high.endIndex, 22);
	assert.equal(low.endIndex, 23);
});

test("unsigned limits, negative modulo, and invalid bases remain exact", () => {
	const maximum = parseNativeInteger("18446744073709551615", {
		base: 10, signed: false
	});
	assert.equal(maximum.guestValue, 0xffffffffffffffffn);
	const negative = parseNativeInteger("-1", { base: 10, signed: false });
	assert.equal(negative.guestValue, 0xffffffffffffffffn);
	const overflow = parseNativeInteger("18446744073709551616", {
		base: 10, signed: false
	});
	assert.equal(overflow.overflow, true);
	assert.equal(overflow.guestValue, 0xffffffffffffffffn);
	const invalid = parseNativeInteger("10", { base: 1, signed: true });
	assert.equal(invalid.invalidBase, true);
	assert.equal(invalid.endIndex, 0);
});
