//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos makes Window identity and state observable instead of ceremonial.
 * Awtsmoos.com uses these witnesses to prove Activity, decor, LayoutParams, flags,
 * colors, soft input, and system-UI state all inhabit the real guest heap story.
 */
import assert from "node:assert/strict";
import test from "node:test";
import {
	MALCHUS_FLAGS_FIELD,
	MALCHUS_SOFT_INPUT_FIELD
} from "../core/android/frameworkAndroidWindowIdentity.js";
import { createFrameworkAndroidSystemUiViewMethods } from "../core/android/frameworkAndroidSystemUiViews.js";
import { createFrameworkAndroidWindowMethods } from "../core/android/frameworkAndroidWindows.js";
import { createAndroidViewState } from "../core/android/viewState.js";
import { createDalvikObjectHeap } from "../core/dalvik/objectHeap.js";

const GET_WINDOW = "Landroid/app/Activity;->getWindow()Landroid/view/Window;";
const GET_DECOR = "Landroid/view/Window;->getDecorView()Landroid/view/View;";
const GET_ATTRIBUTES = "Landroid/view/Window;->getAttributes()Landroid/view/WindowManager$LayoutParams;";
const ADD_FLAGS = "Landroid/view/Window;->addFlags(I)V";
const CLEAR_FLAGS = "Landroid/view/Window;->clearFlags(I)V";
const SET_SOFT_INPUT = "Landroid/view/Window;->setSoftInputMode(I)V";
const SET_STATUS_COLOR = "Landroid/view/Window;->setStatusBarColor(I)V";
const SET_SYSTEM_UI = "Landroid/view/View;->setSystemUiVisibility(I)V";
const GET_SYSTEM_UI = "Landroid/view/View;->getSystemUiVisibility()I";

/** Proves Activity, Window, decor View, and LayoutParams references remain stable. */
function tiferesStableWindowIdentityTest() {
	const tiferes = tiferesWindowFixture();
	const malchusActivity = tiferes.heap.allocate("Landroid/app/Activity;");
	const chayaWindow = tiferes.windowFamily.invoke(sodRecord(GET_WINDOW), [malchusActivity]);
	assert.equal(tiferes.windowFamily.invoke(sodRecord(GET_WINDOW), [malchusActivity]), chayaWindow);
	assert.equal(tiferes.heap.get(chayaWindow).type, "Landroid/view/Window;");
	const chayaDecor = tiferes.windowFamily.invoke(sodRecord(GET_DECOR), [chayaWindow]);
	assert.equal(tiferes.windowFamily.invoke(sodRecord(GET_DECOR), [chayaWindow]), chayaDecor);
	assert.equal(tiferes.heap.get(chayaDecor).type, "Landroid/view/View;");
	assert.equal(tiferes.heap.getField(chayaDecor, "android:context"), malchusActivity);
	const chayaAttributes = tiferes.windowFamily.invoke(sodRecord(GET_ATTRIBUTES), [chayaWindow]);
	assert.equal(tiferes.windowFamily.invoke(sodRecord(GET_ATTRIBUTES), [chayaWindow]), chayaAttributes);
	assert.equal(tiferes.heap.get(chayaAttributes).type, "Landroid/view/WindowManager$LayoutParams;");
}

/** Proves masked flags, soft input, and Window color state mutate real guest fields. */
function netzachWindowMutationTest() {
	const tiferes = tiferesWindowFixture();
	const malchusActivity = tiferes.heap.allocate("Landroid/app/Activity;");
	const chayaWindow = tiferes.windowFamily.invoke(sodRecord(GET_WINDOW), [malchusActivity]);
	const chayaAttributes = tiferes.windowFamily.invoke(sodRecord(GET_ATTRIBUTES), [chayaWindow]);
	tiferes.windowFamily.invoke(sodRecord(ADD_FLAGS), [chayaWindow, -2147483648]);
	tiferes.windowFamily.invoke(sodRecord(ADD_FLAGS), [chayaWindow, 0x04000000]);
	assert.equal(tiferes.heap.getField(chayaAttributes, MALCHUS_FLAGS_FIELD), -2080374784);
	tiferes.windowFamily.invoke(sodRecord(CLEAR_FLAGS), [chayaWindow, 0x04000000]);
	assert.equal(tiferes.heap.getField(chayaAttributes, MALCHUS_FLAGS_FIELD), -2147483648);
	tiferes.windowFamily.invoke(sodRecord(SET_SOFT_INPUT), [chayaWindow, 0x20]);
	assert.equal(tiferes.heap.getField(chayaAttributes, MALCHUS_SOFT_INPUT_FIELD), 0x20);
	tiferes.windowFamily.invoke(sodRecord(SET_STATUS_COLOR), [chayaWindow, -16777216]);
	assert.equal(tiferes.heap.getField(chayaWindow, "android:window:statusBarColor"), -16777216);
}

/** Proves decor system-UI visibility is stored through the normal View state service. */
function yesodDecorSystemUiTest() {
	const tiferes = tiferesWindowFixture();
	const malchusActivity = tiferes.heap.allocate("Landroid/app/Activity;");
	const chayaWindow = tiferes.windowFamily.invoke(sodRecord(GET_WINDOW), [malchusActivity]);
	const chayaDecor = tiferes.windowFamily.invoke(sodRecord(GET_DECOR), [chayaWindow]);
	tiferes.systemUiFamily.invoke(sodRecord(SET_SYSTEM_UI), [chayaDecor, 0x500]);
	assert.equal(tiferes.systemUiFamily.invoke(sodRecord(GET_SYSTEM_UI), [chayaDecor]), 0x500);
	assert.equal(tiferes.views.get(chayaDecor, "systemUiVisibility", 0), 0x500);
}

/** Creates the smallest real heap/view runtime needed by the Window families. */
function tiferesWindowFixture() {
	const heichalHeap = createDalvikObjectHeap();
	const olamRuntime = { heap: heichalHeap, views: createAndroidViewState(heichalHeap) };
	return {
		heap: heichalHeap,
		systemUiFamily: createFrameworkAndroidSystemUiViewMethods(olamRuntime),
		views: olamRuntime.views,
		windowFamily: createFrameworkAndroidWindowMethods(olamRuntime)
	};
}

/** Wraps an exact framework signature for direct family invocation. */
function sodRecord(sodSignature) {
	return Object.freeze({ signature: sodSignature });
}

test("Activity Window, decor, and LayoutParams identities are stable", tiferesStableWindowIdentityTest);
test("Window flags, soft input, and color mutate real guest state", netzachWindowMutationTest);
test("decor system UI visibility uses normal View state", yesodDecorSystemUiTest);
