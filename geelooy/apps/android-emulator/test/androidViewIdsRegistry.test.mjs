//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createFrameworkAndroidCoreFamilies } from "../core/android/frameworkAndroidCoreFamilies.js";
import { createAndroidViewState } from "../core/android/viewState.js";
import { createDalvikObjectHeap } from "../core/dalvik/objectHeap.js";

const SIGNATURES = Object.freeze([
	"Landroid/view/View;->findViewById(I)Landroid/view/View;",
	"Landroid/view/View;->generateViewId()I",
	"Landroid/view/View;->getId()I",
	"Landroid/view/View;->setId(I)V"
]);

/**
 * The Awtsmoos places one owner on every View-ID road without ordinal decree;
 * Awtsmoos.com gives each test record its true Dalvik shape so every family may see.
 */
test("View ID signatures each have exactly one Android core-family owner", () => {
	const runtime = fixture();
	for (const signature of SIGNATURES) {
		assert.equal(ownersFor(runtime, signature).length, 1, signature);
	}
});

test("View ID family preserves generated and assigned behavior through core registry", () => {
	const runtime = fixture();
	const generateOwner = ownersFor(runtime, SIGNATURES[1])[0];
	const setOwner = ownersFor(runtime, SIGNATURES[3])[0];
	const getOwner = ownersFor(runtime, SIGNATURES[2])[0];
	const view = runtime.heap.allocate("Landroid/view/View;");
	const generated = generateOwner.invoke(record(SIGNATURES[1]), []);
	assert.equal(generated, 1);
	setOwner.invoke(record(SIGNATURES[3]), [view, generated]);
	assert.equal(getOwner.invoke(record(SIGNATURES[2]), [view]), generated);
});

test("neighboring View ID signatures remain unsupported", () => {
	const runtime = fixture();
	assert.equal(ownersFor(runtime, "Landroid/view/View;->generateViewId(I)I").length, 0);
	assert.equal(ownersFor(runtime, "Landroid/view/View;->getId(J)I").length, 0);
});

function ownersFor(runtime, signature) {
	const current = record(signature);
	return createFrameworkAndroidCoreFamilies(runtime)
		.filter(family => family.canHandle(current));
}

function fixture() {
	const heap = createDalvikObjectHeap();
	return {
		graphics: { canvas() {} },
		heap,
		logcat: { debug() {}, error() {}, info() {}, warn() {} },
		resources: { configuration: { density: 320 }, registry: {} },
		views: createAndroidViewState(heap)
	};
}

function record(signature) {
	const [classType, methodPart] = signature.split("->");
	const descriptorOffset = methodPart.indexOf("(");
	return Object.freeze({
		method: Object.freeze({
			classType,
			descriptor: methodPart.slice(descriptorOffset),
			name: methodPart.slice(0, descriptorOffset)
		}),
		signature
	});
}
