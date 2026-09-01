//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createAarch64Registers } from "../core/native/aarch64Registers.js";
import { registerNativeAndroidWindowHandlers } from "../core/native/nativeAndroidWindowHandlers.js";
import { createNativeAndroidWindowState } from "../core/native/nativeAndroidWindowState.js";
import { createNativeHostImportRegistry } from "../core/native/nativeHostImportRegistry.js";
import { createJniGuestReferences } from "../core/native/jniGuestReferences.js";

const ENVIRONMENT = 0x5000n;
const RETURN_ADDRESS = 0x7777n;

/**
 * Proves a real JNI Surface becomes an opaque refcounted ANativeWindow with measured size.
 * The Awtsmoos renews Java surface and NDK garment in separate finite light;
 * Awtsmoos.com preserves identity, dimensions, format, and ownership right.
 */
test("ANativeWindow_fromSurface preserves identity and NDK properties", () => {
	const fixture = createFixture();
	const first = invoke(fixture, "ANativeWindow_fromSurface", ENVIRONMENT, fixture.surface);
	const handle = fixture.registers.read(0);
	assert.equal(first.result.handle, handle.toString());
	const second = invoke(fixture, "ANativeWindow_fromSurface", ENVIRONMENT, fixture.surface);
	assert.equal(fixture.registers.read(0), handle);
	assert.equal(second.result.handle, handle.toString());
	assert.equal(invoke(fixture, "ANativeWindow_getWidth", handle).result.value, 360);
	assert.equal(invoke(fixture, "ANativeWindow_getHeight", handle).result.value, 640);
	assert.equal(invoke(fixture, "ANativeWindow_getFormat", handle).result.value, 1);
	assert.equal(invoke(fixture, "ANativeWindow_release", handle).result.references, 1);
	assert.equal(invoke(fixture, "ANativeWindow_release", handle).result.references, 0);
	assert.equal(fixture.windows.record(handle), null);
});

test("ANativeWindow_fromSurface rejects non-Surface JNI references", () => {
	const fixture = createFixture();
	const wrong = fixture.references.create("object", "wrong", {}, {
		dalvikType: "Ljava/lang/Object;",
		scope: "local"
	});
	assert.throws(
		() => invoke(fixture, "ANativeWindow_fromSurface", ENVIRONMENT, wrong),
		error => error.code === "NATIVE_ANDROID_WINDOW_SURFACE_REQUIRED"
	);
});

function createFixture() {
	const references = createJniGuestReferences();
	const target = Object.freeze({ id: 9 });
	const surface = references.create("object", "surface#9", target, {
		dalvikType: "Landroid/view/Surface;",
		scope: "local"
	});
	const machineState = {
		jniEnvironment: Object.freeze({ environmentAddress: ENVIRONMENT.toString() }),
		jniReferences: references,
		resolveNativeSurface(value) {
			assert.equal(value, target);
			return Object.freeze({ format: 1, height: 640, identity: "surface#9", width: 360 });
		}
	};
	const windows = createNativeAndroidWindowState(machineState);
	const registry = createNativeHostImportRegistry();
	registerNativeAndroidWindowHandlers(registry, machineState, windows);
	return {
		references,
		registers: createAarch64Registers({ programCounter: 0x9000n }),
		registry,
		surface,
		windows
	};
}

function invoke(fixture, name, ...values) {
	fixture.registers.pc = 0x9000n;
	values.forEach((value, index) => fixture.registers.write(index, value));
	fixture.registers.write(30, RETURN_ADDRESS);
	const handled = fixture.registry.handle({ name }, fixture);
	assert.equal(fixture.registers.pc, RETURN_ADDRESS);
	return handled;
}
