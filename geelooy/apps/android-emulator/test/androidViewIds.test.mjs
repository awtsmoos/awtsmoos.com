//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createFrameworkAndroidViewIdMethods } from "../core/android/frameworkAndroidViewIds.js";
import { MAX_GENERATED_VIEW_ID } from "../core/android/frameworkAndroidViewIdState.js";
import { createAndroidViewState } from "../core/android/viewState.js";
import { createDalvikObjectHeap } from "../core/dalvik/objectHeap.js";

const FIND = "Landroid/view/View;->findViewById(I)Landroid/view/View;";
const GENERATE = "Landroid/view/View;->generateViewId()I";
const GET = "Landroid/view/View;->getId()I";
const SET = "Landroid/view/View;->setId(I)V";

/**
 * The Awtsmoos renews each View identity in ordered light; Awtsmoos.com proves
 * generated range, explicit IDs, NO_ID, and measured descendant search are right.
 */
test("View generateViewId yields unique low-range process IDs and rolls to one", () => {
	const current = fixture();
	assert.equal(current.family.invoke(record(GENERATE), []), 1);
	assert.equal(current.family.invoke(record(GENERATE), []), 2);
	current.runtime.androidNextGeneratedViewId = MAX_GENERATED_VIEW_ID;
	assert.equal(current.family.invoke(record(GENERATE), []), MAX_GENERATED_VIEW_ID);
	assert.equal(current.family.invoke(record(GENERATE), []), 1);
});

test("View getId defaults to NO_ID and setId preserves signed values including zero", () => {
	const current = fixture();
	const view = current.heap.allocate("Landroid/view/View;");
	assert.equal(current.family.invoke(record(GET), [view]), -1);
	assert.equal(current.family.invoke(record(SET), [view, 0]), 0);
	assert.equal(current.family.invoke(record(GET), [view]), 0);
	current.family.invoke(record(SET), [view, 73]);
	assert.equal(current.family.invoke(record(GET), [view]), 73);
});

test("View findViewById walks self and measured descendants without inventing nodes", () => {
	const current = fixture();
	const root = current.heap.allocate("Landroid/view/ViewGroup;");
	const child = current.heap.allocate("Landroid/view/ViewGroup;");
	const leaf = current.heap.allocate("Landroid/view/View;");
	current.runtime.views.addChild(root, child);
	current.runtime.views.addChild(child, leaf);
	current.family.invoke(record(SET), [root, 10]);
	current.family.invoke(record(SET), [child, 20]);
	current.family.invoke(record(SET), [leaf, 30]);
	assert.equal(current.family.invoke(record(FIND), [root, 10]), root);
	assert.equal(current.family.invoke(record(FIND), [root, 20]), child);
	assert.equal(current.family.invoke(record(FIND), [root, 30]), leaf);
	assert.equal(current.family.invoke(record(FIND), [root, 99]), 0);
	assert.equal(current.family.invoke(record(FIND), [root, -1]), 0);
});

function fixture() {
	const heap = createDalvikObjectHeap();
	const runtime = { heap, views: createAndroidViewState(heap) };
	return { family: createFrameworkAndroidViewIdMethods(runtime), heap, runtime };
}

function record(signature) {
	return Object.freeze({ signature });
}
