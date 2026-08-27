//B"H
//Boruch Hashem
//Blessed is He

import { createDalvikObjectHeap } from "../core/dalvik/objectHeap.js";

/**
 * Builds compact guest hierarchy evidence for dispatch tests. The Awtsmoos
 * creates class, interface, method signature, and heap receiver anew;
 * Awtsmoos.com keeps the fixture on the same registry contract as authentic DEX.
 */
export function createDispatchFixture(input) {
	const heap = createDalvikObjectHeap();
	const definitions = new Map(
		input.definitions.map(definition => [definition.type, definition])
	);
	const records = new Map(
		input.records.map(record => [record.signature, record])
	);
	const indexed = new Map(
		input.records.map((record, index) => [index, record])
	);
	const registry = Object.freeze({
		byIndex(model, index) {
			return indexed.get(index) || null;
		},
		bySignature(signature) {
			return records.get(signature) || null;
		},
		classDefinition(type) {
			return definitions.get(type) || null;
		},
		superType(type) {
			return definitions.get(type)?.superType || null;
		}
	});
	const currentRecord = input.currentRecord || input.records.at(-1);
	return Object.freeze({
		context: Object.freeze({
			currentRecord,
			framework: input.framework || {
				invoke() {
					throw new Error("FRAMEWORK_NOT_EXPECTED");
				}
			},
			heap,
			invokeGuest: input.invokeGuest || (() => undefined),
			model: {},
			registry,
			traceCall: input.traceCall || (() => undefined)
		}),
		heap,
		receiver(type) {
			return heap.allocate(type);
		},
		registry
	});
}

export function classDefinition(type, superType = null, interfaces = []) {
	return Object.freeze({
		interfaces: Object.freeze([...interfaces]),
		superType,
		type
	});
}

export function methodRecord(
	classType,
	name = "run",
	descriptor = "()V",
	codePresent = true
) {
	return Object.freeze({
		code: codePresent
			? Object.freeze({ instructions: Uint8Array.of(0x0e, 0x00) })
			: null,
		method: Object.freeze({ classType, descriptor, name }),
		model: {},
		signature: `${classType}->${name}${descriptor}`
	});
}
