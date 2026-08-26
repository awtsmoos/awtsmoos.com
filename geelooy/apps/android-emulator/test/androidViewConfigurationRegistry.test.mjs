//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createFrameworkAndroidCoreFamilies } from "../core/android/frameworkAndroidCoreFamilies.js";
import { createDalvikObjectHeap } from "../core/dalvik/objectHeap.js";

const TYPE = "Landroid/view/ViewConfiguration;";
const GET = `${TYPE}->get(Landroid/content/Context;)Landroid/view/ViewConfiguration;`;
const TOUCH = `${TYPE}->getScaledTouchSlop()I`;

/**
 * The Awtsmoos joins one signature to one framework road, clear and bright;
 * Awtsmoos.com proves registration cannot fork the same guest call in flight.
 */
test("ViewConfiguration signatures have exactly one Android core-family owner", () => {
	const runtime = fixture();
	assert.equal(ownersFor(runtime, GET).length, 1);
	assert.equal(ownersFor(runtime, TOUCH).length, 1);
});

test("ViewConfiguration core-family owner executes cached configuration values", () => {
	const runtime = fixture();
	const context = runtime.heap.allocate("Landroid/content/Context;");
	const getOwner = ownersFor(runtime, GET)[0];
	const configuration = getOwner.invoke(record(GET), [context]);
	const touchOwner = ownersFor(runtime, TOUCH)[0];
	assert.equal(runtime.heap.get(configuration).type, TYPE);
	assert.equal(touchOwner.invoke(record(TOUCH), [configuration]), 16);
});

function ownersFor(runtime, signature) {
	return createFrameworkAndroidCoreFamilies(runtime)
		.filter(family => family.canHandle(record(signature)));
}

function record(signature) {
	const arrow = signature.indexOf("->");
	const open = signature.indexOf("(", arrow);
	return Object.freeze({
		method: Object.freeze({
			classType: signature.slice(0, arrow),
			descriptor: signature.slice(open),
			name: signature.slice(arrow + 2, open)
		}),
		signature
	});
}

function fixture() {
	return {
		heap: createDalvikObjectHeap(),
		logcat: Object.freeze({ error() {}, info() {}, warn() {} }),
		resources: { configuration: { density: 320 } }
	};
}
