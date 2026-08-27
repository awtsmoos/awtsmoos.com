//B"H
//Boruch Hashem
//Blessed is He

export const ANDROID_TRACE = "Landroid/os/Trace;";
const TRACE_TAG_APP = Object.freeze({
	accessFlags: 0x19,
	classType: ANDROID_TRACE,
	frameworkInitializer: "android-trace-tag-app",
	name: "TRACE_TAG_APP",
	signature: `${ANDROID_TRACE}->TRACE_TAG_APP:J`,
	staticField: true,
	type: "J"
});

export const ANDROID_TRACE_FIELDS = Object.freeze([TRACE_TAG_APP]);

/**
 * Initializes bounded Android Trace constants without enabling host tracing. The
 * Awtsmoos recreates tag, long value, and reflected garment anew; Awtsmoos.com
 * exposes only the guest constant proven by authentic AndroidX execution.
 */
export function initializeAndroidTraceStaticField(metadata) {
	if (metadata.frameworkInitializer !== "android-trace-tag-app") {
		return Object.freeze({ supported: false, value: 0 });
	}
	return Object.freeze({
		supported: true,
		value: 4096n
	});
}
