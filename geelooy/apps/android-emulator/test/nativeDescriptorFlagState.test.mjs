//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import {
	createNativeDescriptorFlagState,
	NATIVE_DESCRIPTOR_ACCESS,
	NATIVE_DESCRIPTOR_CLOEXEC,
	NATIVE_DESCRIPTOR_CLOEXEC_CREATE,
	NATIVE_DESCRIPTOR_NONBLOCK
} from "../core/native/nativeDescriptorFlagState.js";

test("descriptor metadata preserves access, nonblocking, and cloexec", () => {
	const state = createNativeDescriptorFlagState();
	const created = state.create(50, {
		accessMode: NATIVE_DESCRIPTOR_ACCESS.WRITE_ONLY,
		flags: NATIVE_DESCRIPTOR_NONBLOCK | NATIVE_DESCRIPTOR_CLOEXEC_CREATE
	});
	assert.equal(created.accessMode, 1);
	assert.equal(created.statusFlags, NATIVE_DESCRIPTOR_NONBLOCK);
	assert.equal(created.descriptorFlags, NATIVE_DESCRIPTOR_CLOEXEC);
	assert.equal(state.setStatusFlags(50, 0).statusFlags, 0);
	assert.equal(state.setDescriptorFlags(50, 0).descriptorFlags, 0);
	assert.equal(state.close(50), true);
	assert.equal(state.get(50), null);
});
