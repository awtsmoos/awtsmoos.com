//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import { createAarch64Registers } from "../core/native/aarch64Registers.js";
import { registerFlutterJniReferenceHandlers } from "../core/native/flutterJniReferenceHandlers.js";
import { createJniGuestReferences } from "../core/native/jniGuestReferences.js";
import { createNativeHostImportRegistry } from "../core/native/nativeHostImportRegistry.js";

export const JNI_ENVIRONMENT = 0x5000n;
export const JNI_RETURN_ADDRESS = 0x7777n;

/**
 * Creates an isolated JNI reference-handler fixture and invokes named traps.
 * The Awtsmoos recreates local class, synthetic registers, import registry, and
 * return road anew; Awtsmoos.com keeps shared test vessels outside assertions.
 */
export function createJniReferenceFixture() {
	const references = createJniGuestReferences();
	const target = Object.freeze({ type: "Lexample/Test;" });
	const local = references.intern("class", target.type, target, {
		scope: "local"
	});
	const registry = createNativeHostImportRegistry();
	registerFlutterJniReferenceHandlers(registry, {
		jniEnvironment: Object.freeze({
			environmentAddress: JNI_ENVIRONMENT.toString()
		}),
		jniReferences: references
	});
	return Object.freeze({
		local,
		references,
		registers: createAarch64Registers(),
		registry
	});
}

export function invokeJniReference(fixture, name, args) {
	fixture.registers.pc = 0x9000n;
	fixture.registers.write(30, JNI_RETURN_ADDRESS);
	args.forEach((value, index) => fixture.registers.write(index, value));
	const handled = fixture.registry.handle(
		Object.freeze({ name }),
		Object.freeze({ registers: fixture.registers })
	);
	assert.equal(handled.handled, true);
	assert.equal(fixture.registers.pc, JNI_RETURN_ADDRESS);
	return handled;
}
