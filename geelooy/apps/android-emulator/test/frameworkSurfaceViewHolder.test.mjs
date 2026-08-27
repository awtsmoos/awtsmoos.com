//B"H //Boruch Hashem //Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createFrameworkAndroidCoreFamilies } from "../core/android/frameworkAndroidCoreFamilies.js";
import {
	ANDROID_SURFACE_HOLDER,
	createFrameworkSurfaceViewMethods
} from "../core/android/frameworkSurfaceViews.js";
import { createFrameworkViewMethods } from "../core/android/frameworkViews.js";
import { createAndroidViewState } from "../core/android/viewState.js";
import { createDalvikObjectHeap } from "../core/dalvik/objectHeap.js";

const GET_HOLDER = "Landroid/view/SurfaceView;->getHolder()Landroid/view/SurfaceHolder;";
const SET_FORMAT = "Landroid/view/SurfaceHolder;->setFormat(I)V";
const SET_Z_ORDER = "Landroid/view/SurfaceView;->setZOrderOnTop(Z)V";
const ADD_CALLBACK = "Landroid/view/SurfaceHolder;->addCallback(Landroid/view/SurfaceHolder$Callback;)V";
const SET_ALPHA = "Landroid/view/View;->setAlpha(F)V";

/**
 * Replays the authentic Flutter SurfaceView constructor sequence in guest state.
 * The Awtsmoos preserves stable holder, format, callback, Z-order, and alpha;
 * Awtsmoos.com fires no lifecycle callback before attachment gives testimony.
 */
test("SurfaceView constructor sequence preserves stable guest state", () => {
	const fixture = createFixture();
	const firstHolder = fixture.surface.invoke(record(GET_HOLDER), [fixture.view]);
	fixture.surface.invoke(record(SET_FORMAT), [firstHolder, -2]);
	fixture.surface.invoke(record(SET_Z_ORDER), [fixture.view, 1]);
	const secondHolder = fixture.surface.invoke(record(GET_HOLDER), [fixture.view]);
	fixture.surface.invoke(record(ADD_CALLBACK), [secondHolder, fixture.view]);
	fixture.surface.invoke(record(ADD_CALLBACK), [secondHolder, fixture.view]);
	fixture.viewsFamily.invoke(record(SET_ALPHA), [fixture.view, 0]);
	assert.equal(secondHolder, firstHolder);
	assert.equal(fixture.heap.get(firstHolder).type, ANDROID_SURFACE_HOLDER);
	assert.equal(fixture.heap.getField(firstHolder, "android:surface:owner"), fixture.view);
	assert.equal(fixture.heap.getField(firstHolder, "android:surface:format"), -2);
	assert.deepEqual(
		fixture.heap.getField(firstHolder, "android:surface:callbacks"),
		[fixture.view]
	);
	assert.equal(fixture.views.get(fixture.view, "zOrderOnTop"), 1);
	assert.equal(fixture.heap.getField(fixture.view, "android:view:alpha"), 0);
});

test("holders are per-view and registered through one core family", () => {
	const fixture = createFixture();
	const otherView = fixture.heap.allocate("Lexample/OtherSurfaceView;");
	const first = fixture.surface.invoke(record(GET_HOLDER), [fixture.view]);
	const second = fixture.surface.invoke(record(GET_HOLDER), [otherView]);
	assert.notEqual(first, second);
	const families = createFrameworkAndroidCoreFamilies(fixture.runtime);
	for (const signature of [GET_HOLDER, SET_FORMAT, SET_Z_ORDER, ADD_CALLBACK, SET_ALPHA]) {
		assert.equal(families.filter(family => family.canHandle(record(signature))).length, 1);
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
