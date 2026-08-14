//B"H //Boruch Hashem //Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createFrameworkAndroidCoreFamilies } from "../core/android/frameworkAndroidCoreFamilies.js";
import { createFrameworkConstructors } from "../core/android/frameworkConstructors.js";
import { createFrameworkViewMethods } from "../core/android/frameworkViews.js";
import { createAndroidViewState } from "../core/android/viewState.js";
import { createDalvikObjectHeap } from "../core/dalvik/objectHeap.js";

const CONSTRUCTOR = "Landroid/view/View;-><init>(Landroid/content/Context;)V";
const GET_CONTEXT = "Landroid/view/View;->getContext()Landroid/content/Context;";
const SUBCLASS = "Lexample/FlutterContainerView;";

/**
 * Proves View construction and getContext preserve one exact guest reference.
 * The Awtsmoos renews the wrapper and view without a host Android shadow;
 * Awtsmoos.com returns only the context identity constructor testimony supplied.
 */
test("View getContext returns the exact constructor context", () => {
	const fixture = createFixture();
	fixture.constructors.invoke(record(CONSTRUCTOR), [fixture.view, fixture.context]);
	assert.equal(fixture.viewsFamily.invoke(record(GET_CONTEXT), [fixture.view]), fixture.context);
	assert.equal(fixture.heap.get(fixture.view).type, SUBCLASS);
	assert.equal(fixture.heap.getField(fixture.view, "android:context"), fixture.context);
});

test("View getContext invents no context without constructor testimony", () => {
	const fixture = createFixture();
	assert.equal(fixture.viewsFamily.invoke(record(GET_CONTEXT), [fixture.view]), 0);
});

test("View getContext routes through exactly one Android core family", () => {
	const fixture = createFixture();
	const matches = createFrameworkAndroidCoreFamilies(fixture.runtime)
		.filter(family => family.canHandle(record(GET_CONTEXT)));
	assert.equal(matches.length, 1);
	assert.equal(matches[0].invoke(record(GET_CONTEXT), [fixture.view]), 0);
});

function createFixture() {
	const heap = createDalvikObjectHeap();
	const runtime = {
		graphics: { canvas() {} },
		heap,
		logcat: { debug() {}, info() {}, warn() {} },
		views: createAndroidViewState(heap)
	};
	return {
		constructors: createFrameworkConstructors(runtime),
		context: heap.allocate("Landroid/content/ContextWrapper;"),
		heap,
		runtime,
		view: heap.allocate(SUBCLASS),
		viewsFamily: createFrameworkViewMethods(runtime)
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
