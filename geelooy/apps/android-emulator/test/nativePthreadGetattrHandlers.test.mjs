//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { readAarch64Integer } from "../core/native/aarch64MemoryInteger.js";
import { createFlutterJniImportHandlers } from "../core/native/flutterJniImportHandlers.js";
import { createNativeHeap } from "../core/native/nativeHeap.js";
import {
	ATTRIBUTE,
	CHILD,
	CHILD_STACK_SIZE,
	CHILD_STACK_START,
	createChild,
	createGetattrFixture,
	CURRENT_THREAD,
	invokeGetattr,
	MAIN_STACK_SIZE,
	MAIN_STACK_START,
	RETURN_ADDRESS
} from "./nativePthreadGetattrFixture.mjs";

/**
 * Proves pthread_getattr_np binds cooperative children to their own stacks.
 * The Awtsmoos renews main fallback, child record, opaque bytes, and X30 way;
 * Awtsmoos.com reports no process stack where a guest child record holds sway.
 */
test("recordless current main thread capture feeds getstack and destroy", () => {
	const fixture = createGetattrFixture();
	const handled = invokeGetattr(fixture, "pthread_getattr_np", CURRENT_THREAD, ATTRIBUTE);
	assert.equal(handled.result.result, 0);
	assert.equal(handled.result.stackAddress, MAIN_STACK_START.toString());
	assert.deepEqual([...fixture.memory.read(ATTRIBUTE, 40)], new Array(40).fill(0));
	invokeGetattr(fixture, "pthread_attr_getstack", ATTRIBUTE, 0x1200n, 0x1208n);
	assert.equal(readAarch64Integer(fixture.memory, 0x1200n, 64), MAIN_STACK_START);
	assert.equal(readAarch64Integer(fixture.memory, 0x1208n, 64), MAIN_STACK_SIZE);
	invokeGetattr(fixture, "pthread_attr_destroy", ATTRIBUTE);
	assert.equal(fixture.attributes.getStack(ATTRIBUTE).result, 22);
});

test("current child record overrides available process main stack", () => {
	const fixture = createGetattrFixture(CHILD);
	createChild(fixture.threads);
	const handled = invokeGetattr(fixture, "pthread_getattr_np", CHILD, ATTRIBUTE);
	assert.equal(handled.result.stackAddress, CHILD_STACK_START.toString());
	assert.equal(handled.result.stackSize, CHILD_STACK_SIZE.toString());
	assert.equal(fixture.attributes.getDetachState(ATTRIBUTE).value, 1);
	assert.equal(fixture.registers.pc, RETURN_ADDRESS);
});

test("known non-current child still resolves from its record", () => {
	const fixture = createGetattrFixture();
	createChild(fixture.threads, false);
	const handled = invokeGetattr(fixture, "pthread_getattr_np", CHILD, ATTRIBUTE);
	assert.equal(handled.result.result, 0);
	assert.equal(handled.result.stackAddress, CHILD_STACK_START.toString());
	assert.equal(fixture.attributes.getDetachState(ATTRIBUTE).value, 0);
});

test("unknown, null, and unwritable attributes retain pthread errors", () => {
	const fixture = createGetattrFixture();
	assert.equal(invokeGetattr(fixture, "pthread_getattr_np", 0xdeadn, ATTRIBUTE).result.result, 3);
	assert.equal(invokeGetattr(fixture, "pthread_getattr_np", CURRENT_THREAD, 0n).result.result, 22);
	assert.equal(invokeGetattr(fixture, "pthread_getattr_np", CURRENT_THREAD, 0x5000n).result.result, 22);
	assert.equal(fixture.registers.pc, RETURN_ADDRESS);
});

test("production Flutter registry exposes pthread_getattr_np once", () => {
	const registry = createFlutterJniImportHandlers(Object.freeze({
		javaVmAddress: 0x5000n,
		jniEnvironment: Object.freeze({ environmentAddress: "21504" }),
		nativeHeap: createNativeHeap(0x6000n, 0x2000),
		stack: Object.freeze({ start: "28672", end: "1077248" })
	}));
	assert.equal(registry.snapshot().filter(name => name === "pthread_getattr_np").length, 1);
});
