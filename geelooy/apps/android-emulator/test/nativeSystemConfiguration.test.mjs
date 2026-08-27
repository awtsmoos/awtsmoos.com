//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import {
	createNativeSystemConfiguration,
	NATIVE_AARCH64_HWCAP,
	NATIVE_AUXILIARY_TYPES,
	NATIVE_SYSCONF_NAMES
} from "../core/native/nativeSystemConfiguration.js";

test("default configuration exposes deterministic CPU, page, and HWCAP testimony", () => {
	const state = createNativeSystemConfiguration();
	assert.equal(state.query(NATIVE_SYSCONF_NAMES.NPROCESSORS_ONLN).value, 4n);
	assert.equal(state.query(NATIVE_SYSCONF_NAMES.PAGESIZE).value, 4096n);
	assert.equal(state.pageSize(), 4096n);
	assert.deepEqual(state.queryAuxiliary(NATIVE_AUXILIARY_TYPES.HWCAP), {
		known: true,
		name: 16n,
		value: NATIVE_AARCH64_HWCAP.FP | NATIVE_AARCH64_HWCAP.ASIMD
	});
});

test("explicit memory, processor, and hardware masks remain guest-owned", () => {
	const state = createNativeSystemConfiguration({
		availableMemoryBytes: 4096n * 5n,
		hardwareCapabilities: 0x1234n,
		pageSize: 4096n,
		physicalMemoryBytes: 4096n * 9n,
		processorCount: 6n
	});
	assert.equal(state.query(NATIVE_SYSCONF_NAMES.PHYS_PAGES).value, 9n);
	assert.equal(state.query(NATIVE_SYSCONF_NAMES.NPROCESSORS_ONLN).value, 6n);
	assert.equal(state.queryAuxiliary(16n).value, 0x1234n);
});

test("unknown names and impossible settings remain explicit", () => {
	const state = createNativeSystemConfiguration();
	assert.deepEqual(state.query(0x7fffffff), {
		known: false,
		name: 2147483647,
		value: 0n
	});
	assert.deepEqual(state.queryAuxiliary(999n), {
		known: false,
		name: 999n,
		value: 0n
	});
	assert.throws(() => createNativeSystemConfiguration({
		availableMemoryBytes: 2n,
		physicalMemoryBytes: 1n
	}), /NATIVE_SYSTEM_AVAILABLE_MEMORY/);
	assert.ok(Object.isFrozen(state.snapshot()));
});
