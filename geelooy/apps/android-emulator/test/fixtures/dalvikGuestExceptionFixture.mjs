//B"H
//Boruch Hashem
//Blessed is He

import { createDalvikExecutor } from "../../core/dalvik/executor.js";
import { createDalvikObjectHeap } from "../../core/dalvik/objectHeap.js";
import { createDalvikOpcodeRegistry } from "../../core/dalvik/opcodes.js";

const THROW_AND_HANDLE = new Uint8Array([
	0x27, 0x01,
	0x0d, 0x00,
	0x11, 0x00
]);

/**
 * Creates a bounded synthetic Dalvik exception vessel. The Awtsmoos recreates
 * heap, hierarchy, bytecode, protected road, and executor anew; Awtsmoos.com
 * gives each witness isolated references and no framework side effects.
 */
export function createGuestExceptionFixture(options = {}) {
	const instructions = options.instructions || THROW_AND_HANDLE;
	const heap = createDalvikObjectHeap();
	const definitions = new Map([
		["LSub;", definition("LSub;", "LBase;")],
		["LBase;", definition("LBase;", "Ljava/lang/Object;")]
	]);
	const registry = createRegistry(definitions);
	const record = createRecord(
		instructions,
		options.region || null,
		options.insSize ?? (instructions === THROW_AND_HANDLE ? 1 : 0),
		options.registersSize ?? (instructions === THROW_AND_HANDLE ? 2 : 1)
	);
	const executor = createDalvikExecutor({
		classInitializer: createClassInitializer(),
		framework: Object.freeze({
			invoke() {
				throw new Error("unexpected framework invocation");
			}
		}),
		heap,
		opcodes: createDalvikOpcodeRegistry(),
		registry,
		staticFields: Object.freeze({})
	});
	return Object.freeze({ executor, heap, record });
}

export function typedExceptionRegion(type) {
	return Object.freeze({
		catchAllTarget: null,
		endPc: 2,
		handlers: Object.freeze([Object.freeze({ target: 2, type })]),
		startPc: 0
	});
}

export function catchAllExceptionRegion() {
	return Object.freeze({
		catchAllTarget: 2,
		endPc: 2,
		handlers: Object.freeze([]),
		startPc: 0
	});
}

export function moveExceptionOnlyInstructions() {
	return new Uint8Array([
		0x0d, 0x00,
		0x0e, 0x00
	]);
}

function createRecord(instructions, region, insSize, registersSize) {
	return Object.freeze({
		code: Object.freeze({
			exceptionHandlers: Object.freeze(region ? [region] : []),
			insSize,
			instructions,
			registersSize
		}),
		method: Object.freeze({
			classType: "LTest;",
			descriptor: "()V",
			name: "run"
		}),
		model: Object.freeze({ strings: [], types: [] }),
		signature: "LTest;->run()V"
	});
}

function createRegistry(definitions) {
	return Object.freeze({
		classDefinition(type) {
			return definitions.get(type) || null;
		},
		superType(type) {
			return definitions.get(type)?.superType || null;
		}
	});
}

function createClassInitializer() {
	return Object.freeze({
		ensure() {
			return Promise.resolve();
		},
		snapshot() {
			return Object.freeze([]);
		}
	});
}

function definition(type, superType) {
	return Object.freeze({ interfaces: [], superType, type });
}
