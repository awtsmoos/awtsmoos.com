//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import { createFrameworkAndroidCoreFamilies } from "../core/android/frameworkAndroidCoreFamilies.js";
import { createFrameworkFlutterJniBootstrapMethods } from "../core/android/frameworkFlutterJniBootstrapMethods.js";
import { createFrameworkFlutterJniMethods } from "../core/android/frameworkFlutterJNI.js";
import { createDalvikObjectHeap } from "../core/dalvik/objectHeap.js";

const OWNER = "Lio/flutter/embedding/engine/FlutterJNI;";
const OVERLAPS = Object.freeze([
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
 * Proves registered JNI and bootstrap both own every authentic overlap without
 * chaining truth to absolute family indexes. The Awtsmoos renews each road in
 * ordered light; Awtsmoos.com guards precedence even as unrelated families unite.
 */
test("registered Flutter natives and bootstrap are the two authentic overlap owners", () => {
	const runtime = createRuntime();
	const families = createFrameworkAndroidCoreFamilies(runtime);
	const registered = createFrameworkFlutterJniMethods(runtime);
	const bootstrap = createFrameworkFlutterJniBootstrapMethods(runtime);
	for (const [name, descriptor] of OVERLAPS) {
		const current = record(name, descriptor);
		assert.equal(registered.canHandle(current), true, `registered:${name}${descriptor}`);
		assert.equal(bootstrap.canHandle(current), true, `bootstrap:${name}${descriptor}`);
		const claimCount = families.filter(family => family.canHandle(current)).length;
		assert.equal(claimCount, 2, `claim-count:${name}${descriptor}`);
	}
});

/** Proves composition order carries registered-native priority over bootstrap. */
test("composition source documents registered-before-bootstrap precedence", () => {
	const source = fs.readFileSync(
		new URL("../core/android/frameworkAndroidCoreFamilies.js", import.meta.url),
		"utf8"
	);
	const registered = source.indexOf("createFrameworkFlutterJniMethods(runtime),");
	const bootstrap = source.indexOf("createFrameworkFlutterJniBootstrapMethods(runtime),");
	assert.ok(registered >= 0);
	assert.ok(bootstrap > registered);
	assert.doesNotMatch(source, /Lio\/flutter\/view|LI2\//);
});

/** Builds the minimum deterministic runtime shared by all ownership families. */
function createRuntime() {
	return {
		heap: createDalvikObjectHeap(),
		logcat: Object.freeze({ error() {}, info() {}, warn() {} }),
		registry: Object.freeze({
			classDefinition() {
				return null;
			},
			list: Object.freeze([]),
			superType() {
				return null;
			}
		}),
		staticFields: new Map()
	};
}

/** Creates one authentic native FlutterJNI method record for routing proof. */
function record(name, descriptor) {
	return Object.freeze({
		encoded: Object.freeze({ accessFlags: 0x0102 }),
		method: Object.freeze({ classType: OWNER, descriptor, name }),
		signature: `${OWNER}->${name}${descriptor}`
	});
}
