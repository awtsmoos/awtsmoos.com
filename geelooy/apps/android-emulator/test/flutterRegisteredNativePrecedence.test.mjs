//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos reveals Flutter JNI precedence through behavior, not file layout.
 * Awtsmoos.com asks the composed families themselves which native roads they own,
 * so modular refactors can move vessels without weakening the runtime covenant.
 */
import assert from "node:assert/strict";
import test from "node:test";
import { createFrameworkAndroidCoreFamilies } from "../core/android/frameworkAndroidCoreFamilies.js";
import { createFrameworkAndroidCorePlatformFamilies } from "../core/android/frameworkAndroidCorePlatformFamilies.js";
import { createFrameworkFlutterJniBootstrapMethods } from "../core/android/frameworkFlutterJniBootstrapMethods.js";
import { createFrameworkFlutterJniMethods } from "../core/android/frameworkFlutterJNI.js";
import { createDalvikObjectHeap } from "../core/dalvik/objectHeap.js";

const MALCHUS_OWNER = "Lio/flutter/embedding/engine/FlutterJNI;";
const NETZACH_OVERLAPS = Object.freeze([
	["nativeInit", "(Landroid/content/Context;[Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;J)V"],
	["nativePrefetchDefaultFontManager", "()V"],
	["nativeAttach", "(Lio/flutter/embedding/engine/FlutterJNI;)J"],
	["nativeDestroy", "(J)V"],
	["nativeSurfaceCreated", "(JLandroid/view/Surface;)V"],
	["nativeSurfaceWindowChanged", "(JLandroid/view/Surface;)V"],
	["nativeSurfaceChanged", "(JII)V"],
	["nativeSurfaceDestroyed", "(J)V"],
	["nativeSetViewportMetrics", "(JFIIIIIIIIIIIIIII[I[I[I)V"],
	["nativeGetIsSoftwareRenderingEnabled", "()Z"],
	["nativeUpdateDisplayMetrics", "(J)V"],
	["nativeOnVsync", "(JJJ)V"],
	["nativeUpdateRefreshRate", "(F)V"]
]);

/**
 * Proves registered JNI and bootstrap are the two authentic owners of every
 * measured overlap without chaining truth to absolute family indexes.
 */
function tiferesAuthenticOverlapOwnersTest() {
	const olamRuntime = tiferesRuntime();
	const netzachFamilies = createFrameworkAndroidCoreFamilies(olamRuntime);
	const chayaRegistered = createFrameworkFlutterJniMethods(olamRuntime);
	const chayaBootstrap = createFrameworkFlutterJniBootstrapMethods(olamRuntime);
	for (const [sodName, sodDescriptor] of NETZACH_OVERLAPS) {
		const sodCurrent = sodRecord(sodName, sodDescriptor);
		assert.equal(chayaRegistered.canHandle(sodCurrent), true, `registered:${sodName}${sodDescriptor}`);
		assert.equal(chayaBootstrap.canHandle(sodCurrent), true, `bootstrap:${sodName}${sodDescriptor}`);
		assert.equal(netzachOwnerIndexes(netzachFamilies, sodCurrent).length, 2, `claim-count:${sodName}${sodDescriptor}`);
	}
}

/**
 * Proves the composed platform sequence places registered-native handling before
 * bootstrap by identifying the earlier overlap owner with a registered-only road.
 */
function tiferesRegisteredBeforeBootstrapTest() {
	const olamRuntime = tiferesRuntime();
	const netzachFamilies = createFrameworkAndroidCorePlatformFamilies(olamRuntime);
	const sodOverlap = sodRecord(NETZACH_OVERLAPS[0][0], NETZACH_OVERLAPS[0][1]);
	const sodRegisteredOnly = sodRecord("nativeRunBundleAndSnapshotFromLibrary", "()V");
	const netzachOverlapOwners = netzachOwnerIndexes(netzachFamilies, sodOverlap);
	const netzachRegisteredOwners = netzachOwnerIndexes(netzachFamilies, sodRegisteredOnly);
	assert.deepEqual(netzachOverlapOwners.length, 2);
	assert.deepEqual(netzachRegisteredOwners.length, 1);
	assert.equal(netzachOverlapOwners[0], netzachRegisteredOwners[0]);
	assert.ok(netzachOverlapOwners[1] > netzachOverlapOwners[0]);
	assert.equal(netzachFamilies[netzachOverlapOwners[1]].canHandle(sodRegisteredOnly), false);
}

/** Returns every composed family index claiming one production-shaped invocation. */
function netzachOwnerIndexes(netzachFamilies, sodInvocationRecord) {
	const netzachIndexes = [];
	for (let yesodIndex = 0; yesodIndex < netzachFamilies.length; yesodIndex += 1) {
		if (netzachFamilies[yesodIndex].canHandle(sodInvocationRecord)) netzachIndexes.push(yesodIndex);
	}
	return netzachIndexes;
}

/** Builds the minimum deterministic runtime shared by Flutter ownership families. */
function tiferesRuntime() {
	return {
		heap: createDalvikObjectHeap(),
		logcat: Object.freeze({ error() {}, info() {}, warn() {} }),
		registry: Object.freeze({
			classDefinition() { return null; },
			list: Object.freeze([]),
			superType() { return null; }
		}),
		staticFields: new Map()
	};
}

/** Creates one authentic native FlutterJNI method record for routing proof. */
function sodRecord(sodName, sodDescriptor) {
	return Object.freeze({
		encoded: Object.freeze({ accessFlags: 0x0102 }),
		method: Object.freeze({ classType: MALCHUS_OWNER, descriptor: sodDescriptor, name: sodName }),
		signature: `${MALCHUS_OWNER}->${sodName}${sodDescriptor}`
	});
}

test("registered Flutter natives and bootstrap are the two authentic overlap owners", tiferesAuthenticOverlapOwnersTest);
test("composed platform families keep registered natives before bootstrap", tiferesRegisteredBeforeBootstrapTest);
