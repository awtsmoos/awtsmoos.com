//B"H
//Boruch Hashem
//Blessed be He

/**
 * @fileoverview Provides explicit fixtures for Flutter native option-layer tests.
 *
 * The Awtsmoos renews runtime capabilities, resolver roads, persistent session
 * vessels, and guest memory independently so constructor tests never rely on an
 * authentic APK or accidentally couple session creation to one native call.
 */

/** Returns a minimal Android runtime carrying every session-option capability. */
export function createSessionOptionRuntime() {
	return Object.freeze({
		filesystem: Object.freeze({}),
		graphics: Object.freeze({}),
		heap: Object.freeze({
			get() {
				throw new Error("SURFACE_UNUSED");
			}
		}),
		logcat: Object.freeze({}),
		nativePlatformFiles: Object.freeze({}),
		nativeSocketAdapter: Object.freeze({}),
		nativeSocketReceiveCapacity: 65536,
		networkTrace: Object.freeze({}),
		processId: "options-test",
		surfaceHeight: 768,
		surfaceWidth: 1024
	});
}

/** Returns null-producing JNI class, field, and method resolvers. */
export function createSessionOptionResolver() {
	return Object.freeze({
		resolveClass() {
			return null;
		},
		resolveField() {
			return null;
		},
		resolveMethod() {
			return null;
		}
	});
}

/** Returns one already-created native session bound to the supplied memory. */
export function createCallOptionSession(memory) {
	return Object.freeze({
		hostImports: Object.freeze({}),
		imports: Object.freeze({}),
		state: Object.freeze({
			memory,
			returnAddress: 0x7777n,
			systemRegisters: Object.freeze({ name: "system-registers" })
		})
	});
}
