//B"H
//Boruch Hashem
//Blessed be He

import {
	decodeJniPrimitiveValue,
	encodeJniPrimitiveValue,
	jniPrimitiveSpanBytes
} from "./flutterJniPrimitiveArrayCodec.js";
import {
	jniPrimitiveArrayError,
	writeJniPrimitiveIsCopy
} from "./flutterJniPrimitiveArraySupport.js";

const JNI_COMMIT = 1;
const JNI_ABORT = 2;

/**
 * Owns guest-native copies returned by Get*ArrayElements and critical access.
 * JNI explicitly permits copies. Awtsmoos.com therefore never exposes host arrays:
 * native code receives ordinary guest heap addresses with standard commit/abort rules.
 */
export function createJniPrimitiveArrayCopies() {
	const copies = new Map();
	return Object.freeze({
		acquire(machineState, array, spec, isCopyPointer = 0n) {
			const byteLength = jniPrimitiveSpanBytes(spec, array.length);
			if (byteLength === 0) {
				writeJniPrimitiveIsCopy(machineState, isCopyPointer);
				return 0n;
			}
			const pointer = machineState.nativeHeap.allocate(BigInt(byteLength));
			if (pointer === 0n) {
				throw jniPrimitiveArrayError("JNI_PRIMITIVE_ARRAY_ALLOCATION", byteLength);
			}
			const bytes = encodeArray(array, spec);
			machineState.memory.write(pointer, bytes);
			copies.set(pointer, Object.freeze({
				descriptor: spec.descriptor,
				length: array.length,
				target: array.reference.target
			}));
			writeJniPrimitiveIsCopy(machineState, isCopyPointer);
			return pointer;
		},
		release(machineState, array, spec, pointerValue, modeValue) {
			const pointer = BigInt(pointerValue);
			const mode = Number(BigInt.asIntN(32, BigInt(modeValue)));
			if (pointer === 0n && array.length === 0) return Object.freeze({ committed: false, freed: false });
			const copy = copies.get(pointer);
			if (!copy
				|| copy.target !== array.reference.target
				|| copy.descriptor !== spec.descriptor
				|| copy.length !== array.length) {
				throw jniPrimitiveArrayError("JNI_PRIMITIVE_ARRAY_COPY", pointer);
			}
			if (![0, JNI_COMMIT, JNI_ABORT].includes(mode)) {
				throw jniPrimitiveArrayError("JNI_PRIMITIVE_ARRAY_RELEASE_MODE", mode);
			}
			const committed = mode !== JNI_ABORT;
			if (committed) decodeArray(machineState, array, spec, pointer);
			const freed = mode !== JNI_COMMIT;
			if (freed) {
				machineState.nativeHeap.free(pointer);
				copies.delete(pointer);
			}
			return Object.freeze({ committed, freed });
		},
		snapshot() {
			return Object.freeze([...copies.entries()].map(([pointer, copy]) => {
				return Object.freeze({
					descriptor: copy.descriptor,
					length: copy.length,
					pointer: pointer.toString()
				});
			}));
		}
	});
}

function encodeArray(array, spec) {
	const bytes = new Uint8Array(jniPrimitiveSpanBytes(spec, array.length));
	for (let index = 0; index < array.length; index += 1) {
		bytes.set(
			encodeJniPrimitiveValue(spec, array.capabilities.readArrayElement(array.reference.target, index)),
			index * spec.bytes
		);
	}
	return bytes;
}

function decodeArray(machineState, array, spec, pointer) {
	const byteLength = jniPrimitiveSpanBytes(spec, array.length);
	const bytes = machineState.memory.read(pointer, byteLength);
	for (let index = 0; index < array.length; index += 1) {
		array.capabilities.writeArrayElement(
			array.reference.target,
			index,
			decodeJniPrimitiveValue(spec, bytes, index * spec.bytes)
		);
	}
}
