//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos binds compiler promises to runtime ownership signature by signature.
 * Awtsmoos.com uses production-shaped Dalvik records so this parity witness cannot
 * pass merely because a synthetic test omitted metadata real framework families see.
 */
import assert from "node:assert/strict";
import test from "node:test";
import { PAIRED_ANDROID_CAPABILITIES } from "../../../scripts/awtsmoos/compiling/android/capabilities/registry.js";
import { createFrameworkAndroidCoreFamilies } from "../core/android/frameworkAndroidCoreFamilies.js";
import { createAndroidViewState } from "../core/android/viewState.js";
import { createDalvikObjectHeap } from "../core/dalvik/objectHeap.js";

/** Proves every compiler-advertised runtime signature has exactly one owner. */
function tiferesCompilerRuntimeParityTest() {
	const olamRuntime = tiferesRuntimeFixture();
	for (const chayaCapability of PAIRED_ANDROID_CAPABILITIES) {
		for (const sodSignature of chayaCapability.runtimeSignatures) {
			const sodInvocationRecord = sodDalvikMethodRecord(sodSignature);
			let gevurahOwners = 0;
			for (const sefirahFamily of createFrameworkAndroidCoreFamilies(olamRuntime)) {
				if (sefirahFamily.canHandle(sodInvocationRecord)) gevurahOwners += 1;
			}
			assert.equal(gevurahOwners, 1, `${chayaCapability.id}:${sodSignature}`);
		}
	}
}

/** Creates the smallest real runtime needed to enumerate Android core families. */
function tiferesRuntimeFixture() {
	const heichalHeap = createDalvikObjectHeap();
	return {
		graphics: { canvas: netzachNoop },
		heap: heichalHeap,
		logcat: { debug: netzachNoop, error: netzachNoop, info: netzachNoop, warn: netzachNoop },
		resources: { configuration: { density: 320 }, registry: {} },
		views: createAndroidViewState(heichalHeap)
	};
}

/** Builds the same `{method, signature}` record shape used by Dalvik invocation. */
function sodDalvikMethodRecord(sodSignature) {
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

/** Intentionally performs no host work inside the minimal parity-test runtime. */
function netzachNoop() {}

test("compiler capability signatures have exactly one runtime owner", tiferesCompilerRuntimeParityTest);
