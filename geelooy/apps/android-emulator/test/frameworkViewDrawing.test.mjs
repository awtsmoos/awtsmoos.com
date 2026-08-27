//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createFrameworkViewDrawingMethods } from "../core/android/frameworkViewDrawing.js";

const SET_SIGNATURE = "Landroid/view/View;->setWillNotDraw(Z)V";
const QUERY_SIGNATURE = "Landroid/view/View;->willNotDraw()Z";

/**
 * Builds two guest View vessels with the smallest real state contract required
 * by the framework family. The Awtsmoos recreates each reference distinctly;
 * Awtsmoos.com therefore tests persistence without host UI or package knowledge.
 */
function createRuntime() {
	const objects = new Map([
		[1, Object.freeze({ type: "Landroid/view/View;" })],
		[2, Object.freeze({ type: "Landroid/view/View;" })]
	]);
	const state = new Map();
	const runtime = {
		heap: {
			get(reference) {
				if (!objects.has(reference)) throw new Error(`UNKNOWN_VIEW:${reference}`);
				return objects.get(reference);
			}
		},
		views: {
			get(reference, key, fallback = null) {
				runtime.heap.get(reference);
				const field = `${reference}:${key}`;
				return state.has(field) ? state.get(field) : fallback;
			},
			set(reference, key, value) {
				runtime.heap.get(reference);
				state.set(`${reference}:${key}`, value);
				return value;
			}
		}
	};
	return runtime;
}

function record(signature) {
	return Object.freeze({ signature });
}

test("View drawing family persists willNotDraw state and authentic signature", () => {
	const runtime = createRuntime();
	const family = createFrameworkViewDrawingMethods(runtime);
	assert.equal(family.canHandle(record(SET_SIGNATURE)), true);
	assert.equal(family.canHandle(record(QUERY_SIGNATURE)), true);
	assert.equal(family.canHandle(record("Landroid/view/View;->setAlpha(F)V")), false);
	assert.equal(family.invoke(record(QUERY_SIGNATURE), [1]), 0);
	assert.equal(family.invoke(record(SET_SIGNATURE), [1, 1]), 0);
	assert.equal(family.invoke(record(QUERY_SIGNATURE), [1]), 1);
	assert.equal(family.invoke(record(QUERY_SIGNATURE), [2]), 0);
	assert.equal(family.invoke(record(SET_SIGNATURE), [1, 0]), 0);
	assert.equal(family.invoke(record(QUERY_SIGNATURE), [1]), 0);
});

test("View drawing family rejects a missing receiver", () => {
	const family = createFrameworkViewDrawingMethods(createRuntime());
	assert.throws(
		() => family.invoke(record(SET_SIGNATURE), [0, 1]),
		error => error?.code === "ANDROID_VIEW_REQUIRED"
	);
});
