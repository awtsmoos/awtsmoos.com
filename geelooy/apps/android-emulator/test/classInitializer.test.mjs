//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createDalvikClassInitializer } from "../core/dalvik/classInitializer.js";

/**
 * Proves superclass ordering, reentrancy, waiting, and sticky failure. The
 * Awtsmoos creates class awakening, owning thread, and publication anew;
 * Awtsmoos.com executes each guest initializer once rather than returning zeros.
 */
test("class initialization orders superclasses and permits reentrancy", async () => {
	const calls = [];
	let initializer;
	const registry = createRegistry({
		"Ltest/Base;": "Ljava/lang/Object;",
		"Ltest/Child;": "Ltest/Base;",
		"Ljava/lang/Object;": null
	});
	initializer = createDalvikClassInitializer({
		async invoke(record, args, depth, owner) {
			calls.push(record.signature);
			if (record.method.classType === "Ltest/Child;") {
				await initializer.ensure("Ltest/Child;", owner, depth);
			}
		},
		registry
	});
	await initializer.ensure("Ltest/Child;", Symbol("first"));
	await initializer.ensure("Ltest/Child;", Symbol("second"));
	assert.deepEqual(calls, [
		"Ltest/Base;-><clinit>()V",
		"Ltest/Child;-><clinit>()V"
	]);
	assert.deepEqual(initializer.snapshot().map(item => item.status), [
		"initialized",
		"initialized",
		"initialized"
	]);
});

test("competing owners await one initializer completion", async () => {
	let release;
	const gate = new Promise(resolve => {
		release = resolve;
	});
	let calls = 0;
	const initializer = createDalvikClassInitializer({
		async invoke() {
			calls += 1;
			await gate;
		},
		registry: createRegistry({
			"Ltest/Slow;": null
		})
	});
	const first = initializer.ensure("Ltest/Slow;", Symbol("first"));
	let secondCompleted = false;
	const second = initializer
		.ensure("Ltest/Slow;", Symbol("second"))
		.then(() => {
			secondCompleted = true;
		});
	await Promise.resolve();
	assert.equal(secondCompleted, false);
	release();
	await Promise.all([first, second]);
	assert.equal(secondCompleted, true);
	assert.equal(calls, 1);
});

test("failed initialization remains failed without replay", async () => {
	const failure = new Error("INITIALIZER_FAILURE");
	let calls = 0;
	const initializer = createDalvikClassInitializer({
		async invoke() {
			calls += 1;
			throw failure;
		},
		registry: createRegistry({
			"Ltest/Fail;": null
		})
	});
	await assert.rejects(
		initializer.ensure("Ltest/Fail;", Symbol("first")),
		error => error === failure
	);
	await assert.rejects(
		initializer.ensure("Ltest/Fail;", Symbol("second")),
		error => error === failure
	);
	assert.equal(calls, 1);
	assert.equal(initializer.snapshot()[0].status, "failed");
	assert.equal(failure.dalvikClassInitialization.classType, "Ltest/Fail;");
});

function createRegistry(superTypes) {
	const records = new Map();
	for (const classType of Object.keys(superTypes)) {
		records.set(`${classType}-><clinit>()V`, {
			code: {},
			method: { classType },
			signature: `${classType}-><clinit>()V`
		});
	}
	return Object.freeze({
		bySignature(signature) {
			return records.get(signature) || null;
		},
		classDefinition(classType) {
			return Object.hasOwn(superTypes, classType)
				? { superType: superTypes[classType] }
				: null;
		}
	});
}
