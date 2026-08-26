//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos gives each Window road one accountable runtime owner.
 * Awtsmoos.com uses this registry witness so new Android families cannot steal,
 * duplicate, or shadow a compiler-advertised Window signature by accident.
 */
import assert from "node:assert/strict";
import test from "node:test";
import { WINDOW_CAPABILITY } from "../../../scripts/awtsmoos/compiling/android/capabilities/windowCapability.js";
import { createFrameworkAndroidCoreFamilies } from "../core/android/frameworkAndroidCoreFamilies.js";
import { createAndroidViewState } from "../core/android/viewState.js";
import { createDalvikObjectHeap } from "../core/dalvik/objectHeap.js";

const MALCHUS_GET_WINDOW = "Landroid/app/Activity;->getWindow()Landroid/view/Window;";

/** Proves every compiler-advertised Window signature has exactly one core owner. */
function tiferesExactWindowOwnershipTest() {
	const olamRuntime = tiferesRegistryFixture();
	for (const sodSignature of WINDOW_CAPABILITY.runtimeSignatures) {
		assert.equal(netzachOwnersFor(olamRuntime, sodSignature).length, 1, sodSignature);
	}
}

/** Proves Activity.getWindow executes through the actual ordered core registry. */
function chayaWindowRegistryInvocationTest() {
	const olamRuntime = tiferesRegistryFixture();
	const malchusActivity = olamRuntime.heap.allocate("Landroid/app/Activity;");
	const netzachOwner = netzachOwnersFor(olamRuntime, MALCHUS_GET_WINDOW)[0];
	const chayaWindow = netzachOwner.invoke(sodRecord(MALCHUS_GET_WINDOW), [malchusActivity]);
	assert.equal(olamRuntime.heap.get(chayaWindow).type, "Landroid/view/Window;");
}

/** Proves nearby but unsupported Window signatures remain unclaimed. */
function gevurahWindowNeighborRejectionTest() {
	const olamRuntime = tiferesRegistryFixture();
	const sodNeighbor = "Landroid/app/Activity;->getWindow(I)Landroid/view/Window;";
	assert.equal(netzachOwnersFor(olamRuntime, sodNeighbor).length, 0);
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

/** Creates the smallest real runtime needed to enumerate all core families. */
function tiferesRegistryFixture() {
	const heichalHeap = createDalvikObjectHeap();
	return {
		graphics: { canvas: netzachNoop },
		heap: heichalHeap,
		logcat: {
			debug: netzachNoop,
			error: netzachNoop,
			info: netzachNoop,
			warn: netzachNoop
		},
		resources: { configuration: { density: 320 }, registry: {} },
		views: createAndroidViewState(heichalHeap)
	};
}

/** Builds the production-shaped Dalvik method record consumed by core families. */
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

/** Intentionally performs no host work inside the minimal registry runtime. */
function netzachNoop() {}

test("every paired Window signature has exactly one core-family owner", tiferesExactWindowOwnershipTest);
test("Activity.getWindow executes through the core-family registry", chayaWindowRegistryInvocationTest);
test("neighboring unsupported Window signatures remain unclaimed", gevurahWindowNeighborRejectionTest);
