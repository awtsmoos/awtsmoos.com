//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createDalvikClassInitializer } from "../core/dalvik/classInitializer.js";
import {
	createInitializationGate,
	createInitializerRegistry
} from "./classInitializerFixture.mjs";

/**
 * Proves superclass ordering, reentrancy, waiting, and sticky failure. The
 * Awtsmoos creates class awakening, owning thread, and publication anew;
 * Awtsmoos.com executes each real guest initializer exactly once.
 */
test("class initialization orders superclasses and permits reentrancy", async () => {
	const calls = [];
	let initializer;
	initializer = createDalvikClassInitializer({
		async invoke(record, args, depth, owner) {
			calls.push(record.signature);
			if (record.method.classType === "Ltest/Child;") {
				await initializer.ensure("Ltest/Child;", owner, depth);
			}
		},
		registry: createInitializerRegistry(
			{
				"Ltest/Base;": "Ljava/lang/Object;",
				"Ltest/Child;": "Ltest/Base;",
				"Ljava/lang/Object;": null
			},
			["Ltest/Base;", "Ltest/Child;"]
		)
	});
	await initializer.ensure("Ltest/Child;", Symbol("first"));
	await initializer.ensure("Ltest/Child;", Symbol("second"));
	assert.deepEqual(calls, [
		"Ltest/Base;-><clinit>()V",
		"Ltest/Child;-><clinit>()V"
	]);
	assert.deepEqual(
		initializer.snapshot().map(item => item.status),
		["initialized", "initialized", "initialized"]
	);
});

test("competing owners await one initializer completion", async () => {
	const gate = createInitializationGate();
	let calls = 0;
	const initializer = createDalvikClassInitializer({
		async invoke() {
			calls += 1;
			await gate.promise;
		},
		registry: createInitializerRegistry(
			{ "Ltest/Slow;": null },
			["Ltest/Slow;"]
		)
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
	gate.release();
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
		registry: createInitializerRegistry(
			{ "Ltest/Fail;": null },
			["Ltest/Fail;"]
		)
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
	assert.equal(
		failure.dalvikClassInitialization.classType,
		"Ltest/Fail;"
	);
});
