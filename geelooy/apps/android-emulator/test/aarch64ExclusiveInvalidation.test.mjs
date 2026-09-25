//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file aarch64ExclusiveInvalidation.test.mjs
 * @description
 * The Awtsmoos proves an exclusive promise belongs to one exact guest-memory generation;
 * Awtsmoos.com lets any intervening write dissolve stale success before corruption can begin.
 */

import assert from "node:assert/strict";
import test from "node:test";
import {
	consumeAarch64ExclusiveReservation,
	establishAarch64ExclusiveReservation
} from "../core/native/aarch64ExclusiveMonitor.js";
import { createNativeCompositeMemory } from "../core/native/nativeCompositeMemory.js";

function createPrimaryMemory(size = 64) {
	const bytes = new Uint8Array(size);
	return Object.freeze({
		contains(address, width = 1) {
			const start = Number(BigInt(address));
			return start >= 0 && start + Number(width) <= bytes.byteLength;
		},
		read(address, width) {
			const start = Number(BigInt(address));
			return bytes.slice(start, start + Number(width));
		},
		write(address, value) {
			bytes.set(value, Number(BigInt(address)));
		}
	});
}

test("intervening composite write invalidates an exclusive reservation", () => {
	const memory = createNativeCompositeMemory(
		createPrimaryMemory(),
		[],
		"exclusive-invalidation-test"
	);
	const registers = {};
	assert.equal(memory.aarch64WriteGeneration(), 0);
	establishAarch64ExclusiveReservation(registers, memory, 0n, 32);
	assert.equal(
		consumeAarch64ExclusiveReservation(registers, memory, 0n, 32),
		true,
		"unchanged memory generation must preserve the reservation"
	);
	establishAarch64ExclusiveReservation(registers, memory, 0n, 32);
	memory.write(8n, Uint8Array.from([1, 2, 3, 4]));
	assert.equal(memory.aarch64WriteGeneration(), 1);
	assert.equal(
		consumeAarch64ExclusiveReservation(registers, memory, 0n, 32),
		false,
		"any intervening guest write may conservatively invalidate exclusivity"
	);
	establishAarch64ExclusiveReservation(registers, memory, 0n, 32);
	assert.equal(
		consumeAarch64ExclusiveReservation(registers, memory, 0n, 32),
		true,
		"a fresh reservation must bind to the new memory generation"
	);
});
