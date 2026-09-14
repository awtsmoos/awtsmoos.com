//B"H
//Boruch Hashem
//Blessed be He

import { createAarch64Registers } from "../core/native/aarch64Registers.js";
import { registerFlutterJniStringHandlers } from "../core/native/flutterJniStringHandlers.js";
import { createJniGuestReferences } from "../core/native/jniGuestReferences.js";
import { createNativeHeap } from "../core/native/nativeHeap.js";
import { createNativeHostImportRegistry } from "../core/native/nativeHostImportRegistry.js";

export const ENVIRONMENT = 0x4000n;
export const RETURN_ADDRESS = 0x7777n;
export const THREAD_KEY = 0x12345000n;

/**
 * Creates a complete JNI string-family ABI fixture with authentic guest memory.
 * The same heap backs host-import reads and JNI returned pointers so construction,
 * copying, regions, releases, and reference lifetime share one measured vessel.
 */
export function createStringFamilyFixture() {
	const heap = createNativeHeap(0x10000n, 0x8000);
	const references = createJniGuestReferences();
	const registers = createAarch64Registers();
	const registry = createNativeHostImportRegistry();
	const machineState = createMachineState(heap, references);
	registerFlutterJniStringHandlers(registry, machineState);
	return Object.freeze({
		addString(value) {
			return references.create(
				"string",
				`fixture:${references.snapshot().length}:${value}`,
				value,
				{
					descriptor: "Ljava/lang/String;",
					scope: "local"
				},
				THREAD_KEY
			);
		},
		heap,
		invoke(name, argumentsList) {
			registers.write(0, ENVIRONMENT, 64, "zero");
			for (let index = 0; index < argumentsList.length; index += 1) {
				registers.write(index + 1, BigInt(argumentsList[index]), 64, "zero");
			}
			registers.write(30, RETURN_ADDRESS, 64, "zero");
			return registry.handle(
				Object.freeze({ name: `JNINativeInterface.${name}` }),
				Object.freeze({ memory: heap, registers })
			);
		},
		readReference(handle) {
			return references.find(BigInt(handle));
		},
		registers,
		writeBytes(bytes) {
			const pointer = heap.allocate(BigInt(bytes.length));
			heap.write(pointer, new Uint8Array(bytes));
			return pointer;
		}
	});
}
function createMachineState(heap, references) {
	return Object.freeze({
		jniEnvironment: Object.freeze({
			environmentAddress: ENVIRONMENT.toString()
		}),
		jniReferences: references,
		nativeHeap: heap,
		resolveStringValue(target) {
			return target;
		},
		systemRegisters: Object.freeze({
			read(name) {
				return name === "TPIDR_EL0" ? THREAD_KEY : 0n;
			}
		})
	});
}
