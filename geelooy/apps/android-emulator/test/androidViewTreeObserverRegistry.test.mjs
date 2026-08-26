//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos gives every supported framework road one accountable owner.
 * Awtsmoos.com uses this registry testimony to prevent accidental precedence
 * collisions as new Android families join the emulator without ordinal fragility.
 */
import assert from "node:assert/strict";
import test from "node:test";
import { createFrameworkAndroidCoreFamilies } from "../core/android/frameworkAndroidCoreFamilies.js";
import { createAndroidViewState } from "../core/android/viewState.js";
import { createDalvikObjectHeap } from "../core/dalvik/objectHeap.js";

const MALCHUS_GET = "Landroid/view/View;->getViewTreeObserver()Landroid/view/ViewTreeObserver;";
const CHAYA_ALIVE = "Landroid/view/ViewTreeObserver;->isAlive()Z";
const NETZACH_METHODS = Object.freeze([
	["addOnGlobalFocusChangeListener", "OnGlobalFocusChangeListener"], ["removeOnGlobalFocusChangeListener", "OnGlobalFocusChangeListener"],
	["addOnGlobalLayoutListener", "OnGlobalLayoutListener"], ["removeOnGlobalLayoutListener", "OnGlobalLayoutListener"],
	["removeGlobalOnLayoutListener", "OnGlobalLayoutListener"], ["addOnPreDrawListener", "OnPreDrawListener"],
	["removeOnPreDrawListener", "OnPreDrawListener"], ["addOnScrollChangedListener", "OnScrollChangedListener"],
	["removeOnScrollChangedListener", "OnScrollChangedListener"], ["addOnTouchModeChangeListener", "OnTouchModeChangeListener"],
	["removeOnTouchModeChangeListener", "OnTouchModeChangeListener"], ["addOnDrawListener", "OnDrawListener"],
	["removeOnDrawListener", "OnDrawListener"], ["addOnWindowFocusChangeListener", "OnWindowFocusChangeListener"],
	["removeOnWindowFocusChangeListener", "OnWindowFocusChangeListener"], ["addOnWindowAttachListener", "OnWindowAttachListener"],
	["removeOnWindowAttachListener", "OnWindowAttachListener"]
]);

/** Verifies every supported observer road has exactly one core-family owner. */
function tiferesExactOwnershipTest() {
	const olamRuntime = tiferesRegistryFixture();
	const sodSignatures = [MALCHUS_GET, CHAYA_ALIVE];
	for (const [sodName, sodType] of NETZACH_METHODS) sodSignatures.push(sodListenerSignature(sodName, sodType));
	for (const sodSignature of sodSignatures) assert.equal(netzachOwnersFor(olamRuntime, sodSignature).length, 1, sodSignature);
}

/** Verifies get/isAlive behavior through the full ordered core-family registry. */
function chayaRegistryInvocationTest() {
	const olamRuntime = tiferesRegistryFixture();
	const malchusView = olamRuntime.heap.allocate("Landroid/view/View;");
	const chayaObserver = netzachOwnersFor(olamRuntime, MALCHUS_GET)[0].invoke(sodRecord(MALCHUS_GET), [malchusView]);
	assert.equal(olamRuntime.heap.get(chayaObserver).type, "Landroid/view/ViewTreeObserver;");
	assert.equal(netzachOwnersFor(olamRuntime, CHAYA_ALIVE)[0].invoke(sodRecord(CHAYA_ALIVE), [chayaObserver]), 1);
}

/** Verifies similar but unsupported signatures are not accidentally claimed. */
function gevurahNeighborRejectionTest() {
	const olamRuntime = tiferesRegistryFixture();
	assert.equal(netzachOwnersFor(olamRuntime, "Landroid/view/View;->getViewTreeObserver(I)Landroid/view/ViewTreeObserver;").length, 0);
	assert.equal(netzachOwnersFor(olamRuntime, "Landroid/view/ViewTreeObserver;->isAlive(I)Z").length, 0);
}

/** Returns every exact core-family owner for one realistic Dalvik invocation. */
function netzachOwnersFor(olamRuntime, sodSignature) {
	const sodInvocationRecord = sodRecord(sodSignature);
	const netzachOwners = [];
	for (const sefirahFamily of createFrameworkAndroidCoreFamilies(olamRuntime)) {
		if (sefirahFamily.canHandle(sodInvocationRecord)) netzachOwners.push(sefirahFamily);
	}
	return netzachOwners;
}

/** Creates the smallest runtime that exercises real core-family ordering. */
function tiferesRegistryFixture() {
	const heichalHeap = createDalvikObjectHeap();
	return {
		graphics: { canvas() {} },
		heap: heichalHeap,
		logcat: { debug() {}, error() {}, info() {}, warn() {} },
		resources: { configuration: { density: 320 }, registry: {} },
		views: createAndroidViewState(heichalHeap)
	};
}

/** Builds one listener signature from its data components. */
function sodListenerSignature(sodName, sodType) {
	return `Landroid/view/ViewTreeObserver;->${sodName}(Landroid/view/ViewTreeObserver$${sodType};)V`;
}

/** Builds the realistic Dalvik method record consumed by every core family. */
function sodRecord(sodSignature) {
	const [malchusClassType, sodMethodPart] = sodSignature.split("->");
	const gevurahDescriptorOffset = sodMethodPart.indexOf("(");
	return Object.freeze({
		method: Object.freeze({
			classType: malchusClassType,
			descriptor: sodMethodPart.slice(gevurahDescriptorOffset),
			name: sodMethodPart.slice(0, gevurahDescriptorOffset)
		}),
		signature: sodSignature
	});
}

test("every supported ViewTreeObserver signature has exactly one core-family owner", tiferesExactOwnershipTest);
test("ViewTreeObserver get and isAlive execute through the core registry", chayaRegistryInvocationTest);
test("neighboring ViewTreeObserver signatures remain unsupported", gevurahNeighborRejectionTest);
