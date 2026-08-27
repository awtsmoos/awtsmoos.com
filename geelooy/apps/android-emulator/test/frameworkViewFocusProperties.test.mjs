//B"H //Boruch Hashem //Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createFrameworkAndroidCoreFamilies } from "../core/android/frameworkAndroidCoreFamilies.js";
import { createFrameworkViewMethods } from "../core/android/frameworkViews.js";
import { createAndroidViewState } from "../core/android/viewState.js";
import { createDalvikObjectHeap } from "../core/dalvik/objectHeap.js";

const SET_FOCUSABLE = "Landroid/view/View;->setFocusable(Z)V";
const SET_TOUCH_FOCUS = "Landroid/view/View;->setFocusableInTouchMode(Z)V";
const SUBCLASS = "Lexample/FlutterContainerView;";

/**
 * Proves focusability setters preserve exact guest configuration without
 * requesting focus. The Awtsmoos renews both flags on one view vessel;
 * Awtsmoos.com creates no host focus, event, or hidden focus-owner state.
 */
test("View focus setters store the authentic true sequence", () => {
	const fixture = createFixture();
	assert.equal(fixture.family.invoke(record(SET_FOCUSABLE), [fixture.view, 1]), 0);
	assert.equal(fixture.family.invoke(record(SET_TOUCH_FOCUS), [fixture.view, 1]), 0);
	assert.equal(fixture.heap.get(fixture.view).type, SUBCLASS);
	assert.equal(fixture.heap.getField(fixture.view, "android:view:focusable"), 1);
	assert.equal(
		fixture.heap.getField(fixture.view, "android:view:focusableInTouchMode"),
		1
	);
	assert.equal(fixture.heap.getField(fixture.view, "android:view:focused"), 0);
});

test("View focus setters preserve exact false values", () => {
	const fixture = createFixture();
	fixture.family.invoke(record(SET_FOCUSABLE), [fixture.view, 0]);
	fixture.family.invoke(record(SET_TOUCH_FOCUS), [fixture.view, 0]);
	assert.equal(fixture.heap.getField(fixture.view, "android:view:focusable"), 0);
	assert.equal(
		fixture.heap.getField(fixture.view, "android:view:focusableInTouchMode"),
		0
	);
});

test("focus signatures route through exactly one Android core family", () => {
	const fixture = createFixture();
	const families = createFrameworkAndroidCoreFamilies(fixture.runtime);
	for (const signature of [SET_FOCUSABLE, SET_TOUCH_FOCUS]) {
		assert.equal(
			families.filter(family => family.canHandle(record(signature))).length,
			1
		);
	}
});

function createFixture() {
	const heap = createDalvikObjectHeap();
	const views = createAndroidViewState(heap);
	const runtime = {
		graphics: { canvas() {} },
		heap,
		logcat: { debug() {}, info() {}, warn() {} },
		views
	};
	return {
		family: createFrameworkViewMethods(runtime),
		heap,
		runtime,
		view: heap.allocate(SUBCLASS)
	};
}

function record(signature) {
	const arrow = signature.indexOf("->");
	const open = signature.indexOf("(", arrow);
	return {
		method: {
			classType: signature.slice(0, arrow),
			descriptor: signature.slice(open),
			name: signature.slice(arrow + 2, open)
		},
		signature
	};
}
