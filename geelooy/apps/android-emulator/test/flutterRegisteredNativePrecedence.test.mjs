//B"H //Boruch Hashem //Blessed is He

import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import { createDalvikObjectHeap } from "../core/dalvik/objectHeap.js";
import { createFrameworkAndroidCoreFamilies } from "../core/android/frameworkAndroidCoreFamilies.js";

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

test("registered Flutter natives precede bootstrap for all authentic overlaps", () => {
	const families = createFrameworkAndroidCoreFamilies(createRuntime());
	for (const [name, descriptor] of OVERLAPS) {
		const claims = families.map((family, index) => {
			return family.canHandle(record(name, descriptor)) ? index : -1;
		}).filter(index => index >= 0);
		assert.deepEqual(claims, [31, 32], `${name}${descriptor}`);
	}
});

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

function createRuntime() {
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

function record(name, descriptor) {
	return Object.freeze({
		encoded: Object.freeze({ accessFlags: 0x0102 }),
		method: Object.freeze({ classType: OWNER, descriptor, name }),
		signature: `${OWNER}->${name}${descriptor}`
	});
}
