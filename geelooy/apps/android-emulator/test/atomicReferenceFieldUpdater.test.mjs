//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createFrameworkAtomicMethods } from "../core/android/frameworkAtomics.js";
import { createDalvikClassValue } from "../core/android/frameworkJavaClassValues.js";
import { createDalvikObjectHeap } from "../core/dalvik/objectHeap.js";

const UPDATER = "Ljava/util/concurrent/atomic/AtomicReferenceFieldUpdater;";
const TARGET = "Ltest/StateHolder;";
const VALUE = "Ltest/State;";
const FIELD_KEY = `${TARGET}->_state:${VALUE}`;

/**
 * Proves reflective reference-field atomics over the same bounded fields used by
 * Dalvik bytecode. The Awtsmoos renews target, witnessed value, comparison, and
 * publication; Awtsmoos.com keeps no AndroidX-specific path inside the updater.
 */
test("field updater creates metadata and performs reads and writes", () => {
	const fixture = createUpdaterFixture();
	const first = fixture.heap.allocate(VALUE);
	const second = fixture.heap.allocate(VALUE);
	fixture.heap.setField(fixture.target, FIELD_KEY, first);
	assert.equal(fixture.call("get", "(Ljava/lang/Object;)Ljava/lang/Object;", [fixture.updater, fixture.target]), first);
	fixture.call("setRelease", "(Ljava/lang/Object;Ljava/lang/Object;)V", [fixture.updater, fixture.target, second]);
	assert.equal(fixture.heap.getField(fixture.target, FIELD_KEY), second);
});

test("field updater compares by guest identity and exchanges values", () => {
	const fixture = createUpdaterFixture();
	const first = fixture.heap.allocate(VALUE);
	const second = fixture.heap.allocate(VALUE);
	const third = fixture.heap.allocate(VALUE);
	fixture.heap.setField(fixture.target, FIELD_KEY, first);
	assert.equal(fixture.call("compareAndSet", "(Ljava/lang/Object;Ljava/lang/Object;Ljava/lang/Object;)Z", [fixture.updater, fixture.target, first, second]), 1);
	assert.equal(fixture.call("weakCompareAndSetPlain", "(Ljava/lang/Object;Ljava/lang/Object;Ljava/lang/Object;)Z", [fixture.updater, fixture.target, first, third]), 0);
	assert.equal(fixture.call("getAndSet", "(Ljava/lang/Object;Ljava/lang/Object;)Ljava/lang/Object;", [fixture.updater, fixture.target, third]), second);
	assert.equal(fixture.call("compareAndExchangeAcquire", "(Ljava/lang/Object;Ljava/lang/Object;Ljava/lang/Object;)Ljava/lang/Object;", [fixture.updater, fixture.target, third, first]), third);
	assert.equal(fixture.heap.getField(fixture.target, FIELD_KEY), first);
});

test("field updater accepts subclasses and rejects incompatible targets", () => {
	const fixture = createUpdaterFixture("Ltest/ChildHolder;");
	const value = fixture.heap.allocate(VALUE);
	fixture.call("set", "(Ljava/lang/Object;Ljava/lang/Object;)V", [fixture.updater, fixture.target, value]);
	assert.equal(fixture.heap.getField(fixture.target, FIELD_KEY), value);
	const wrong = fixture.heap.allocate("Ltest/WrongHolder;");
	assert.throws(
		() => fixture.call("get", "(Ljava/lang/Object;)Ljava/lang/Object;", [fixture.updater, wrong]),
		error => error.code === "ANDROID_ATOMIC_FIELD_TARGET_MISMATCH"
	);
});

function createUpdaterFixture(targetType = TARGET) {
	const heap = createDalvikObjectHeap();
	const registry = createRegistry();
	const runtime = { heap, registry };
	const methods = createFrameworkAtomicMethods(runtime);
	const call = (name, descriptor, args) => methods.invoke(
		methodRecord(name, descriptor),
		args
	);
	const updater = call(
		"newUpdater",
		"(Ljava/lang/Class;Ljava/lang/Class;Ljava/lang/String;)Ljava/util/concurrent/atomic/AtomicReferenceFieldUpdater;",
		[createDalvikClassValue(TARGET), createDalvikClassValue(VALUE), "_state"]
	);
	return Object.freeze({
		call,
		heap,
		target: heap.allocate(targetType),
		updater
	});
}

function createRegistry() {
	const superTypes = new Map([
		[TARGET, "Ljava/lang/Object;"],
		["Ltest/ChildHolder;", TARGET],
		["Ltest/WrongHolder;", "Ljava/lang/Object;"],
		["Ljava/lang/Object;", null]
	]);
	return Object.freeze({
		classDefinition(type) {
			return superTypes.has(type) ? { superType: superTypes.get(type) } : null;
		},
		superType(type) {
			return superTypes.get(type) || null;
		}
	});
}

function methodRecord(name, descriptor) {
	return {
		method: { classType: UPDATER, descriptor, name },
		signature: `${UPDATER}->${name}${descriptor}`
	};
}
