//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { toDalvikDouble } from "../core/dalvik/dalvikFloatingValues.js";
import { executeArithmeticOperation } from "../core/dalvik/operations/arithmetic.js";
import { executeUnaryOperation } from "../core/dalvik/operations/unary.js";

test("raw const-wide bits reveal exact double values", () => {
	assert.equal(toDalvikDouble(4696837146684686336n), 1000000);
	assert.equal(toDalvikDouble(4611686018427387904n), 2);
	assert.equal(toDalvikDouble(0x7ff0000000000000n), Infinity);
	assert.ok(Number.isNaN(toDalvikDouble(0x7ff8000000000000n)));
	assert.equal(toDalvikDouble(3.5), 3.5);
});

test("Flutter old-generation heap chain computes 2147", () => {
	const frame = fixture();
	frame.registers.set(1, 4294967296n);
	executeUnaryOperation({ a: 2, b: 1, name: "long-to-double" }, frame);
	frame.registers.set(3, 4696837146684686336n);
	executeArithmeticOperation({ a: 4, b: 2, c: 3, name: "div-double" }, frame);
	frame.registers.set(5, 4611686018427387904n);
	executeArithmeticOperation({ a: 6, b: 4, c: 5, name: "div-double" }, frame);
	executeUnaryOperation({ a: 7, b: 6, name: "double-to-int" }, frame);
	assert.equal(frame.registers.get(7), 2147);
});

test("computed Number doubles remain numeric rather than reinterpreted", () => {
	const frame = fixture();
	frame.registers.set(1, 7.5);
	frame.registers.set(2, 2.5);
	executeArithmeticOperation({ a: 3, b: 1, c: 2, name: "add-double" }, frame);
	assert.equal(frame.registers.get(3), 10);
});

function fixture() {
	const values = new Map();
	return {
		registers: {
			get(index) {
				return values.get(index) ?? 0;
			},
			set(index, value) {
				values.set(index, value);
			}
		}
	};
}
