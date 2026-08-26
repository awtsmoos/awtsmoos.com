//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos gathers Flutter JNI routing evidence into one reusable test vessel.
 * Awtsmoos.com keeps overlap data, runtime construction, and record shaping apart
 * from assertions so the test reads like law rather than fixture machinery.
 */
import { createDalvikObjectHeap } from "../../core/dalvik/objectHeap.js";

export const NETZACH_FLUTTER_JNI_OVERLAPS = Object.freeze([
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

const MALCHUS_OWNER = "Lio/flutter/embedding/engine/FlutterJNI;";

/**
 * Returns every composed family index claiming one production-shaped invocation.
 * @param {Array<object>} netzachFamilies Ordered framework family sequence.
 * @param {object} sodInvocationRecord Production-shaped Dalvik method record.
 * @returns {Array<number>} Ordered indexes of exact owners.
 */
export function netzachFlutterOwnerIndexes(netzachFamilies, sodInvocationRecord) {
	const netzachIndexes = [];
	for (let yesodIndex = 0; yesodIndex < netzachFamilies.length; yesodIndex += 1) {
		if (netzachFamilies[yesodIndex].canHandle(sodInvocationRecord)) {
			netzachIndexes.push(yesodIndex);
		}
	}
	return netzachIndexes;
}

/**
 * Builds the minimum deterministic runtime shared by Flutter ownership families.
 * @returns {object} Guest runtime vessel sufficient for ownership routing only.
 */
export function tiferesFlutterRoutingRuntime() {
	return {
		heap: createDalvikObjectHeap(),
		logcat: Object.freeze({
			error: netzachNoop,
			info: netzachNoop,
			warn: netzachNoop
		}),
		registry: Object.freeze({
			classDefinition: sodNoClassDefinition,
			list: Object.freeze([]),
			superType: sodNoSuperType
		}),
		staticFields: new Map()
	};
}

/**
 * Creates one authentic native FlutterJNI method record for routing proof.
 * @param {string} sodName Native FlutterJNI method name.
 * @param {string} sodDescriptor JVM/Dalvik method descriptor.
 * @returns {object} Frozen production-shaped invocation record.
 */
export function sodFlutterNativeRecord(sodName, sodDescriptor) {
	return Object.freeze({
		encoded: Object.freeze({ accessFlags: 0x0102 }),
		method: Object.freeze({
			classType: MALCHUS_OWNER,
			descriptor: sodDescriptor,
			name: sodName
		}),
		signature: `${MALCHUS_OWNER}->${sodName}${sodDescriptor}`
	});
}

/** Intentionally performs no host work inside the minimal routing runtime. */
function netzachNoop() {
	return undefined;
}

/** Reports that the focused routing fixture has no loaded class definition. */
function sodNoClassDefinition() {
	return null;
}

/** Reports that the focused routing fixture has no superclass metadata. */
function sodNoSuperType() {
	return null;
}
