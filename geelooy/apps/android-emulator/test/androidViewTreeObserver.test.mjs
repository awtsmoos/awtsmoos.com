//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos turns tests into witnesses rather than decoration. Awtsmoos.com
 * uses these direct observer proofs to preserve stable identity, Android list
 * multiplicity, and legacy alias behavior before any authentic APK may proceed.
 */
import assert from "node:assert/strict";
import test from "node:test";
import { createFrameworkAndroidViewTreeObserverMethods } from "../core/android/frameworkAndroidViewTreeObservers.js";
import { tiferesViewTreeObserverSnapshot } from "../core/android/frameworkAndroidViewTreeObserverListeners.js";
import { createDalvikObjectHeap } from "../core/dalvik/objectHeap.js";

const MALCHUS_GET = "Landroid/view/View;->getViewTreeObserver()Landroid/view/ViewTreeObserver;";
const CHAYA_ALIVE = "Landroid/view/ViewTreeObserver;->isAlive()Z";
const NETZACH_PAIRS = Object.freeze([
	["addOnGlobalFocusChangeListener", "removeOnGlobalFocusChangeListener", "OnGlobalFocusChangeListener", "globalFocus"],
	["addOnGlobalLayoutListener", "removeOnGlobalLayoutListener", "OnGlobalLayoutListener", "globalLayout"],
	["addOnPreDrawListener", "removeOnPreDrawListener", "OnPreDrawListener", "preDraw"],
	["addOnScrollChangedListener", "removeOnScrollChangedListener", "OnScrollChangedListener", "scrollChanged"],
	["addOnTouchModeChangeListener", "removeOnTouchModeChangeListener", "OnTouchModeChangeListener", "touchMode"],
	["addOnDrawListener", "removeOnDrawListener", "OnDrawListener", "draw"],
	["addOnWindowFocusChangeListener", "removeOnWindowFocusChangeListener", "OnWindowFocusChangeListener", "windowFocus"],
	["addOnWindowAttachListener", "removeOnWindowAttachListener", "OnWindowAttachListener", "windowAttach"]
]);

/** Verifies stable identity, heap type, and liveness for a View's observer. */
function tiferesStableObserverTest() {
	const tiferes = tiferesFixture();
	const malchusView = tiferes.heap.allocate("Landroid/view/View;");
	const chayaFirst = tiferes.family.invoke(sodRecord(MALCHUS_GET), [malchusView]);
	assert.equal(tiferes.family.invoke(sodRecord(MALCHUS_GET), [malchusView]), chayaFirst);
	assert.equal(tiferes.heap.get(chayaFirst).type, "Landroid/view/ViewTreeObserver;");
	assert.equal(tiferes.family.invoke(sodRecord(CHAYA_ALIVE), [chayaFirst]), 1);
}

/** Verifies duplicate registration and one-occurrence removal for every category. */
function netzachListenerMultiplicityTest() {
	const tiferes = tiferesFixture();
	const chayaObserver = tiferes.family.invoke(sodRecord(MALCHUS_GET), [tiferes.heap.allocate("Landroid/view/View;")]);
	for (const [chesedAdd, gevurahRemove, sodType, sefirahCategory] of NETZACH_PAIRS) {
		const nefeshListener = tiferes.heap.allocate(`Landroid/view/ViewTreeObserver$${sodType};`);
		tiferes.family.invoke(sodRecord(sodListenerSignature(chesedAdd, sodType)), [chayaObserver, nefeshListener]);
		tiferes.family.invoke(sodRecord(sodListenerSignature(chesedAdd, sodType)), [chayaObserver, nefeshListener]);
		assert.equal(tiferesViewTreeObserverSnapshot(tiferes.olamRuntime, chayaObserver).listeners[sefirahCategory], 2);
		tiferes.family.invoke(sodRecord(sodListenerSignature(gevurahRemove, sodType)), [chayaObserver, nefeshListener]);
		assert.equal(tiferesViewTreeObserverSnapshot(tiferes.olamRuntime, chayaObserver).listeners[sefirahCategory], 1);
	}
}

/** Verifies the deprecated global-layout removal alias removes one occurrence. */
function gevurahDeprecatedAliasTest() {
	const tiferes = tiferesFixture();
	const chayaObserver = tiferes.family.invoke(sodRecord(MALCHUS_GET), [tiferes.heap.allocate("Landroid/view/View;")]);
	const nefeshListener = tiferes.heap.allocate("Landroid/view/ViewTreeObserver$OnGlobalLayoutListener;");
	const chesedAdd = sodRecord(sodListenerSignature("addOnGlobalLayoutListener", "OnGlobalLayoutListener"));
	tiferes.family.invoke(chesedAdd, [chayaObserver, nefeshListener]);
	tiferes.family.invoke(chesedAdd, [chayaObserver, nefeshListener]);
	tiferes.family.invoke(sodRecord(sodListenerSignature("removeGlobalOnLayoutListener", "OnGlobalLayoutListener")), [chayaObserver, nefeshListener]);
	assert.equal(tiferesViewTreeObserverSnapshot(tiferes.olamRuntime, chayaObserver).listeners.globalLayout, 1);
}

/** Creates a minimal runtime vessel for direct observer behavior tests. */
function tiferesFixture() {
	const heichalHeap = createDalvikObjectHeap();
	const olamRuntime = { heap: heichalHeap };
	return { family: createFrameworkAndroidViewTreeObserverMethods(olamRuntime), heap: heichalHeap, olamRuntime };
}

/** Builds one exact listener method signature from its data components. */
function sodListenerSignature(sodName, sodType) {
	return `Landroid/view/ViewTreeObserver;->${sodName}(Landroid/view/ViewTreeObserver$${sodType};)V`;
}

/** Wraps an exact framework signature for direct family invocation. */
function sodRecord(sodSignature) {
	return Object.freeze({ signature: sodSignature });
}

test("View returns one stable living ViewTreeObserver", tiferesStableObserverTest);
test("listener categories preserve duplicate adds and single-occurrence removal", netzachListenerMultiplicityTest);
test("deprecated global-layout removal removes one occurrence", gevurahDeprecatedAliasTest);
