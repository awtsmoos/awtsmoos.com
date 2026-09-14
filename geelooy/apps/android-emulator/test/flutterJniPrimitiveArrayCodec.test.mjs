//B"H
//Boruch Hashem
//Blessed be He

import assert from "node:assert/strict";
import test from "node:test";
import {
	decodeJniPrimitiveValue,
	encodeJniPrimitiveValue,
	jniPrimitiveSpanBytes
} from "../core/native/flutterJniPrimitiveArrayCodec.js";
import { JNI_PRIMITIVE_ARRAY_SPECS } from "../core/native/flutterJniPrimitiveArraySpecs.js";

const VALUES = Object.freeze({
	boolean: 1,
	byte: -128,
	char: 65535,
	double: -Math.PI,
	float: Math.fround(1.25),
	int: -2147483648,
	long: -0x123456789abcdefn,
	short: -32768
});

test("every JNI primitive codec round-trips its Java scalar width", () => {
	for (const spec of JNI_PRIMITIVE_ARRAY_SPECS) {
		const expected = VALUES[spec.kind];
		const encoded = encodeJniPrimitiveValue(spec, expected);
		assert.equal(encoded.byteLength, spec.bytes, spec.kind);
		const decoded = decodeJniPrimitiveValue(spec, encoded);
		if (spec.kind === "double") {
			assert.equal(decoded, expected);
		} else if (spec.kind === "float") {
			assert.equal(decoded, Math.fround(expected));
		} else {
			assert.equal(decoded, expected);
		}
		assert.equal(jniPrimitiveSpanBytes(spec, 3), spec.bytes * 3);
	}
});
