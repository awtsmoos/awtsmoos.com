//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createFrameworkAndroidCoreFamilies } from "../core/android/frameworkAndroidCoreFamilies.js";
import { createFrameworkConstructors } from "../core/android/frameworkConstructors.js";
import { createFrameworkViewMethods } from "../core/android/frameworkViews.js";
import { createAndroidViewState } from "../core/android/viewState.js";
import { createDalvikObjectHeap } from "../core/dalvik/objectHeap.js";

const CONSTRUCTOR = "Landroid/view/View;-><init>(Landroid/content/Context;)V";
const GET_CONTEXT = "Landroid/view/View;->getContext()Landroid/content/Context;";
const GET_RESOURCES = "Landroid/view/View;->getResources()Landroid/content/res/Resources;";
const SUBCLASS = "Lexample/FlutterContainerView;";

/**
 * Proves View construction preserves guest context and resource identity.
 * The Awtsmoos renews each wrapper without a host Android shadow;
 * Awtsmoos.com returns only references already rooted in guest testimony.
 */
test("View getContext returns the exact constructor context", () => {
	const fixture = createFixture();
	constructView(fixture);
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
	const matches = matchingCoreFamilies(fixture, GET_CONTEXT);
	assert.equal(matches.length, 1);
	assert.equal(matches[0].invoke(record(GET_CONTEXT), [fixture.view]), 0);
});

test("View getResources returns one stable guest Resources reference", () => {
	const fixture = createFixture();
	constructView(fixture);
	const first = fixture.viewsFamily.invoke(record(GET_RESOURCES), [fixture.view]);
	const second = fixture.viewsFamily.invoke(record(GET_RESOURCES), [fixture.view]);
	assert.equal(first, second);
	assert.equal(fixture.heap.get(first).type, "Landroid/content/res/Resources;");
	assert.equal(first, fixture.runtime.androidResourceState.resources);
});

test("View getResources invents no resources without constructor context", () => {
	const fixture = createFixture();
	assert.equal(fixture.viewsFamily.invoke(record(GET_RESOURCES), [fixture.view]), 0);
	assert.equal(fixture.runtime.androidResourceState, undefined);
});

test("View getResources routes through exactly one Android core family", () => {
	const fixture = createFixture();
	const matches = matchingCoreFamilies(fixture, GET_RESOURCES);
	assert.equal(matches.length, 1);
	assert.equal(matches[0].invoke(record(GET_RESOURCES), [fixture.view]), 0);
});

function constructView(fixture) {
	fixture.constructors.invoke(record(CONSTRUCTOR), [fixture.view, fixture.context]);
}

function matchingCoreFamilies(fixture, signature) {
	return createFrameworkAndroidCoreFamilies(fixture.runtime)
		.filter(family => family.canHandle(record(signature)));
}

function createFixture() {
	const heap = createDalvikObjectHeap();
	const runtime = {
		graphics: { canvas() {} },
		heap,
		logcat: { debug() {}, info() {}, warn() {} },
		resources: {
			configuration: { density: 320, language: "en", smallestWidthDp: 360 },
			registry: {}
		},
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
