//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import {
	createNativeSystemConfiguration,
	NATIVE_SYSCONF_NAMES
} from "../core/native/nativeSystemConfiguration.js";

test("default Android configuration answers Bionic CPU and page queries", () => {
	const state = createNativeSystemConfiguration();
	assert.deepEqual(state.query(NATIVE_SYSCONF_NAMES.NPROCESSORS_ONLN), {
		known: true,
		name: 97,
		value: 4n
	});
	assert.equal(state.query(NATIVE_SYSCONF_NAMES.NPROCESSORS_CONF).value, 4n);
	assert.equal(state.query(NATIVE_SYSCONF_NAMES.PAGESIZE).value, 4096n);
	assert.equal(state.query(NATIVE_SYSCONF_NAMES.PAGE_SIZE).value, 4096n);
	assert.equal(state.pageSize(), 4096n);
});

test("memory page counts and stable limits derive from explicit guest values", () => {
	const state = createNativeSystemConfiguration({
		availableMemoryBytes: 4096n * 5n,
		pageSize: 4096n,
		physicalMemoryBytes: 4096n * 9n,
		processorCount: 6n
	});
	assert.equal(state.query(NATIVE_SYSCONF_NAMES.PHYS_PAGES).value, 9n);
	assert.equal(state.query(NATIVE_SYSCONF_NAMES.AVPHYS_PAGES).value, 5n);
	assert.equal(state.query(NATIVE_SYSCONF_NAMES.NPROCESSORS_ONLN).value, 6n);
	assert.equal(state.query(NATIVE_SYSCONF_NAMES.CLK_TCK).value, 100n);
	assert.equal(state.query(NATIVE_SYSCONF_NAMES.THREAD_STACK_MIN).value, 16384n);
});

test("unknown names and impossible memory settings remain explicit", () => {
	const state = createNativeSystemConfiguration();
	assert.deepEqual(state.query(0x7fffffffn), {
		known: false,
		name: 2147483647,
		value: -1n
	});
	assert.throws(() => createNativeSystemConfiguration({
		availableMemoryBytes: 2n,
		physicalMemoryBytes: 1n
	}), /NATIVE_SYSTEM_AVAILABLE_MEMORY/);
	assert.ok(Object.isFrozen(state.snapshot()));
});
