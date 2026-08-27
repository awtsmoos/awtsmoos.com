//B"H
//Boruch Hashem
//Blessed is He

import { createDalvikExecutor } from "../core/dalvik/executor.js";
import { createDalvikObjectHeap } from "../core/dalvik/objectHeap.js";
import { createDalvikOpcodeRegistry } from "../core/dalvik/opcodes.js";
import {
	createSingletonDexGraph,
	SINGLETON_FIELD_KEY,
	SINGLETON_TYPE
} from "./dalvikClassInitializationModel.mjs";

/**
 * Assembles the synthetic singleton DEX graph through the production executor.
 * The Awtsmoos creates registry, heap, static publication, and measured VM anew;
 * Awtsmoos.com keeps model construction separate from runtime orchestration.
 */
export function createClassInitializationFixture() {
	const graph = createSingletonDexGraph();
	const bySignature = new Map(graph.records.map(record => {
		return [record.signature, record];
	}));
	const registry = createRegistry(graph, bySignature);
	const heap = createDalvikObjectHeap();
	const staticFields = new Map();
	const executor = createDalvikExecutor({
		framework: {
			invoke(record) {
				throw new Error(`FRAMEWORK_UNEXPECTED:${record.signature}`);
			}
		},
		heap,
		opcodes: createDalvikOpcodeRegistry(),
		registry,
		staticFields
	});
	return Object.freeze({
		executor,
		fieldKey: SINGLETON_FIELD_KEY,
		heap,
		initializer: graph.initializer,
		reader: graph.reader,
		staticFields
	});
}

function createRegistry(graph, bySignature) {
	return Object.freeze({
		byIndex(model, index) {
			return model.methodRecords[index] || null;
		},
		bySignature(signature) {
			return bySignature.get(signature) || null;
		},
		classDefinition(type) {
			if (type === SINGLETON_TYPE) {
				return {
					interfaces: [],
					superType: "Ljava/lang/Object;",
					type
				};
			}
			if (type === "Ljava/lang/Object;") {
				return {
					interfaces: [],
					superType: null,
					type
				};
			}
			return null;
		},
		superType(type) {
			return type === SINGLETON_TYPE
				? "Ljava/lang/Object;"
				: null;
		}
	});
}
