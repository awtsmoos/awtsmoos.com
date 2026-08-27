//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { decodeAarch64Instruction } from "../core/native/aarch64Decoder.js";
import { decodeAarch64SimdFloatingMinMax } from "../core/native/aarch64DecodeSimdFloatingMinMax.js";
import { executeAarch64Data } from "../core/native/aarch64ExecuteData.js";
import { createAarch64Registers } from "../core/native/aarch64Registers.js";

const WORDS = [
	["fmaxnm", 0x0e25c424, 0x4e25c424, 0x4e65c424],
	["fminnm", 0x0ea5c424, 0x4ea5c424, 0x4ee5c424],
	["fmax", 0x0e25f424, 0x4e25f424, 0x4e65f424],
	["fmin", 0x0ea5f424, 0x4ea5f424, 0x4ee5f424]
];

function pack(values, width) {
	const b = new ArrayBuffer(16), v = new DataView(b);
	values.forEach((x, i) => width === 32 ? v.setFloat32(i * 4, x, true) : v.setFloat64(i * 8, x, true));
	return v.getBigUint64(0, true) | (v.getBigUint64(8, true) << 64n);
}

function unpack(bits, width, count) {
	const b = new ArrayBuffer(16), v = new DataView(b);
	v.setBigUint64(0, BigInt.asUintN(64, bits), true); v.setBigUint64(8, bits >> 64n, true);
	return Array.from({length: count}, (_, i) => width === 32 ? v.getFloat32(i * 4, true) : v.getFloat64(i * 8, true));
}

test("decodes every legal vector floating min/max arrangement", () => {
	for (const [mnemonic, twoS, fourS, twoD] of WORDS) {
		for (const [word, width, lanes] of [[twoS,32,2],[fourS,32,4],[twoD,64,2]]) {
			const d = decodeAarch64SimdFloatingMinMax(word);
			assert.deepEqual([d?.mnemonic,d?.elementWidth,d?.laneCount],[mnemonic,width,lanes]);
		}
	}
	assert.equal(decodeAarch64Instruction(0x4e65f424).mnemonic, "fmax");
	assert.equal(decodeAarch64SimdFloatingMinMax(0x0e65f424), null);
});

test("authentic 2D FMAX executes lane-wise with source alias safety", () => {
	const r=createAarch64Registers(); r.writeVector(1,pack([-4,9],64)); r.writeVector(5,pack([3,2],64));
	const d=decodeAarch64Instruction(0x4e65f424); assert.equal(executeAarch64Data(d,r),true);
	assert.deepEqual(unpack(r.readVector(4),64,2),[3,9]);
});

test("numeric forms suppress one NaN while ordinary forms propagate it", () => {
	const r=createAarch64Registers(); r.writeVector(1,pack([Number.NaN,7,Number.NaN,2],32)); r.writeVector(5,pack([3,Number.NaN,Number.NaN,8],32));
	assert.equal(executeAarch64Data(decodeAarch64Instruction(0x4e25c424),r),true);
	const nm=unpack(r.readVector(4),32,4); assert.equal(nm[0],3); assert.equal(nm[1],7); assert.ok(Number.isNaN(nm[2])); assert.equal(nm[3],8);
	assert.equal(executeAarch64Data(decodeAarch64Instruction(0x4e25f424),r),true);
	const normal=unpack(r.readVector(4),32,4); assert.ok(Number.isNaN(normal[0])); assert.ok(Number.isNaN(normal[1]));
});

test("max/min preserve IEEE signed-zero choice", () => {
	const r=createAarch64Registers(); r.writeVector(1,pack([-0,+0],64)); r.writeVector(5,pack([+0,-0],64));
	executeAarch64Data(decodeAarch64Instruction(0x4e65f424),r); const max=unpack(r.readVector(4),64,2); assert.ok(Object.is(max[0],+0)); assert.ok(Object.is(max[1],+0));
	executeAarch64Data(decodeAarch64Instruction(0x4ee5f424),r); const min=unpack(r.readVector(4),64,2); assert.ok(Object.is(min[0],-0)); assert.ok(Object.is(min[1],-0));
});
