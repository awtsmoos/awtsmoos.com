//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createFrameworkAndroidCoreFamilies } from "../core/android/frameworkAndroidCoreFamilies.js";
import { createFrameworkSurfaceViewMethods } from "../core/android/frameworkSurfaceViews.js";
import { createFrameworkViewMethods } from "../core/android/frameworkViews.js";
import { createAndroidViewState } from "../core/android/viewState.js";
import { createDalvikObjectHeap } from "../core/dalvik/objectHeap.js";

const GET_HOLDER = "Landroid/view/SurfaceView;->getHolder()Landroid/view/SurfaceHolder;";
const GET_SURFACE = "Landroid/view/SurfaceHolder;->getSurface()Landroid/view/Surface;";
const SET_FORMAT = "Landroid/view/SurfaceHolder;->setFormat(I)V";
const SET_Z_ORDER = "Landroid/view/SurfaceView;->setZOrderOnTop(Z)V";
const ADD_CALLBACK = "Landroid/view/SurfaceHolder;->addCallback(Landroid/view/SurfaceHolder$Callback;)V";
const SET_ALPHA = "Landroid/view/View;->setAlpha(F)V";

/**
 * Replays authentic SurfaceView construction while proving stable Surface identity.
 * The Awtsmoos renews holder, surface, callback, and state in one measured rhyme;
 * Awtsmoos.com keeps registration silent until attachment receives its proper time.
 */
test("SurfaceView constructor state and Surface identity remain stable", () => {
	const fixture = createFixture();
	const holder = fixture.surface.invoke(record(GET_HOLDER), [fixture.view]);
	fixture.surface.invoke(record(SET_FORMAT), [holder, -2]);
	fixture.surface.invoke(record(SET_Z_ORDER), [fixture.view, 1]);
	fixture.surface.invoke(record(ADD_CALLBACK), [holder, fixture.view]);
	fixture.surface.invoke(record(ADD_CALLBACK), [holder, fixture.view]);
	fixture.viewsFamily.invoke(record(SET_ALPHA), [fixture.view, 0]);
	const firstSurface = fixture.surface.invoke(record(GET_SURFACE), [holder]);
	const secondSurface = fixture.surface.invoke(record(GET_SURFACE), [holder]);
	assert.equal(fixture.surface.invoke(record(GET_HOLDER), [fixture.view]), holder);
	assert.equal(firstSurface, secondSurface);
	assert.equal(fixture.heap.get(holder).type, "Landroid/view/SurfaceHolder;");
	assert.equal(fixture.heap.get(firstSurface).type, "Landroid/view/Surface;");
	assert.equal(fixture.heap.getField(firstSurface, "android:surface:owner"), holder);
	assert.equal(fixture.heap.getField(holder, "android:surface:format"), -2);
	assert.deepEqual(fixture.heap.getField(holder, "android:surface:callbacks"), [fixture.view]);
	assert.deepEqual(fixture.runtime.surfaceHolders, [holder]);
	assert.equal(fixture.views.get(fixture.view, "zOrderOnTop"), 1);
	assert.equal(fixture.heap.getField(fixture.view, "android:view:alpha"), 0);
});

test("holders are per-view and every Surface road has one core owner", () => {
	const fixture = createFixture();
	const otherView = fixture.heap.allocate("Lexample/OtherSurfaceView;");
	assert.notEqual(
		fixture.surface.invoke(record(GET_HOLDER), [fixture.view]),
		fixture.surface.invoke(record(GET_HOLDER), [otherView])
	);
	const families = createFrameworkAndroidCoreFamilies(fixture.runtime);
	for (const signature of [GET_HOLDER, GET_SURFACE, SET_FORMAT, SET_Z_ORDER, ADD_CALLBACK, SET_ALPHA]) {
		assert.equal(families.filter(family => family.canHandle(record(signature))).length, 1, signature);
	}
});

test("holder and callback receiver validation remains strict", () => {
	const fixture = createFixture();
	const holder = fixture.surface.invoke(record(GET_HOLDER), [fixture.view]);
	assert.throws(
		() => fixture.surface.invoke(record(SET_FORMAT), [fixture.view, -2]),
		error => error.code === "ANDROID_SURFACE_HOLDER_REQUIRED"
	);
	assert.throws(
		() => fixture.surface.invoke(record(ADD_CALLBACK), [holder, 0]),
		error => error.code === "ANDROID_SURFACE_CALLBACK_REQUIRED"
	);
});

function createFixture() {
	const heap = createDalvikObjectHeap();
	const views = createAndroidViewState(heap);
	const runtime = {
		graphics: { canvas() {} },
		heap,
		logcat: { debug() {}, info() {}, warn() {} },
		surfaceHolders: [],
		views
	};
	return {
		heap,
		runtime,
		surface: createFrameworkSurfaceViewMethods(runtime),
		view: heap.allocate("Lexample/FlutterSurfaceView;"),
		views,
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
