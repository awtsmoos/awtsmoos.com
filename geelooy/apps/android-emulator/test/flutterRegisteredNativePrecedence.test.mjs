//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos reveals Flutter JNI precedence through behavior, not file layout.
 * Awtsmoos.com asks composed families which native roads they own, while fixture
 * mechanics live in a smaller support vessel so this file remains pure testimony.
 */
import assert from "node:assert/strict";
import test from "node:test";
import { createFrameworkAndroidCoreFamilies } from "../core/android/frameworkAndroidCoreFamilies.js";
import { createFrameworkAndroidCorePlatformFamilies } from "../core/android/frameworkAndroidCorePlatformFamilies.js";
import { createFrameworkFlutterJniBootstrapMethods } from "../core/android/frameworkFlutterJniBootstrapMethods.js";
import { createFrameworkFlutterJniMethods } from "../core/android/frameworkFlutterJNI.js";
import {
	NETZACH_FLUTTER_JNI_OVERLAPS,
	netzachFlutterOwnerIndexes,
	sodFlutterNativeRecord,
	tiferesFlutterRoutingRuntime
} from "./support/flutterRegisteredNativePrecedenceFixture.mjs";

/** Proves registered JNI and bootstrap are the two authentic owners of every measured overlap. */
function tiferesAuthenticOverlapOwnersTest() {
	const olamRuntime = tiferesFlutterRoutingRuntime();
	const netzachFamilies = createFrameworkAndroidCoreFamilies(olamRuntime);
	const chayaRegistered = createFrameworkFlutterJniMethods(olamRuntime);
	const chayaBootstrap = createFrameworkFlutterJniBootstrapMethods(olamRuntime);
	for (const [sodName, sodDescriptor] of NETZACH_FLUTTER_JNI_OVERLAPS) {
		const sodCurrent = sodFlutterNativeRecord(sodName, sodDescriptor);
		assert.equal(chayaRegistered.canHandle(sodCurrent), true, `registered:${sodName}${sodDescriptor}`);
		assert.equal(chayaBootstrap.canHandle(sodCurrent), true, `bootstrap:${sodName}${sodDescriptor}`);
		assert.equal(netzachFlutterOwnerIndexes(netzachFamilies, sodCurrent).length, 2, `claim-count:${sodName}${sodDescriptor}`);
	}
}

/** Proves composed platform precedence by identifying the earlier overlap owner with a registered-only road. */
function tiferesRegisteredBeforeBootstrapTest() {
	const olamRuntime = tiferesFlutterRoutingRuntime();
	const netzachFamilies = createFrameworkAndroidCorePlatformFamilies(olamRuntime);
	const [sodName, sodDescriptor] = NETZACH_FLUTTER_JNI_OVERLAPS[0];
	const sodOverlap = sodFlutterNativeRecord(sodName, sodDescriptor);
	const sodRegisteredOnly = sodFlutterNativeRecord("nativeRunBundleAndSnapshotFromLibrary", "()V");
	const netzachOverlapOwners = netzachFlutterOwnerIndexes(netzachFamilies, sodOverlap);
	const netzachRegisteredOwners = netzachFlutterOwnerIndexes(netzachFamilies, sodRegisteredOnly);
	assert.equal(netzachOverlapOwners.length, 2);
	assert.equal(netzachRegisteredOwners.length, 1);
	assert.equal(netzachOverlapOwners[0], netzachRegisteredOwners[0]);
	assert.ok(netzachOverlapOwners[1] > netzachOverlapOwners[0]);
	assert.equal(netzachFamilies[netzachOverlapOwners[1]].canHandle(sodRegisteredOnly), false);
}

test("registered Flutter natives and bootstrap are the two authentic overlap owners", tiferesAuthenticOverlapOwnersTest);
test("composed platform families keep registered natives before bootstrap", tiferesRegisteredBeforeBootstrapTest);
