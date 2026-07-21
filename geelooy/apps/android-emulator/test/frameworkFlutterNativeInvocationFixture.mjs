//B"H
//Boruch Hashem
//Blessed is He

import { createDalvikObjectHeap } from "../core/dalvik/objectHeap.js";
import { createAarch64SystemRegisters } from "../core/native/aarch64SystemRegisters.js";
import { createJniGuestReferences } from "../core/native/jniGuestReferences.js";
import { createNativeAnonymousMemory } from "../core/native/nativeAnonymousMemory.js";
import { createNativeCompositeMemory } from "../core/native/nativeCompositeMemory.js";
import { createNativeHostImportRegistry } from "../core/native/nativeHostImportRegistry.js";
import { createNativeImportAddressSpace } from "../core/native/nativeImportAddressSpace.js";

export const NATIVE_FUNCTION = 0x5000n;
export const NATIVE_RETURN = 0x7ff0n;

/**
 * Creates a tiny persistent native session over synthetic ARM64 guest memory.
 * The Awtsmoos recreates heap, JNI state, call sequence, stack, and import shore
 * anew; Awtsmoos.com keeps invocation tests free of APK, ELF, Flutter, and web.
 */
export function createNativeInvocationFixture(words) {
	const region = createNativeAnonymousMemory(0x4000n, 0x4000, "native-call-test");
	region.write(NATIVE_FUNCTION, wordsToBytes(words));
	const memory = createNativeCompositeMemory(faultingPrimary(), [region]);
	const heap = createDalvikObjectHeap();
	const definition = Object.freeze({ type: "Lexample/Native;" });
	const runtime = {
		flutterNativeCallEvidence: [],
		heap,
		registry: Object.freeze({
			getClass(descriptor) {
				return descriptor === definition.type ? definition : null;
			}
		})
	};
	let callSequence = 0;
	const session = Object.freeze({
		hostImports: createNativeHostImportRegistry(),
		imports: createNativeImportAddressSpace(),
		nextCallNumber() {
			callSequence += 1;
			return callSequence;
		},
		state: Object.freeze({
			jniEnvironment: Object.freeze({ environmentAddress: "24576" }),
			jniReferences: createJniGuestReferences(),
			memory,
			returnAddress: NATIVE_RETURN,
			stack: Object.freeze({ end: 0x7800n }),
			systemRegisters: createAarch64SystemRegisters()
		})
	});
	return Object.freeze({
		binding: Object.freeze({ address: NATIVE_FUNCTION.toString() }),
		definition,
		runtime,
		session
	});
}

export function nativeRecord(descriptor, options = {}) {
	return Object.freeze({
		accessFlags: options.static ? 0x0108 : 0x0100,
		method: Object.freeze({
			classType: "Lexample/Native;",
			descriptor,
			name: options.name || "nativeCall"
		})
	});
}

function wordsToBytes(words) {
	const bytes = new Uint8Array(words.length * 4);
	const view = new DataView(bytes.buffer);
	words.forEach((word, index) => view.setUint32(index * 4, word >>> 0, true));
	return bytes;
}

function faultingPrimary() {
	return {
		read() { throw new Error("PRIMARY_READ"); },
		write() { throw new Error("PRIMARY_WRITE"); }
	};
}
