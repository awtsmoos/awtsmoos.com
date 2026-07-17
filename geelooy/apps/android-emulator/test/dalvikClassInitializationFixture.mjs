//B"H
//Boruch Hashem
//Blessed is He

import { createDalvikExecutor } from "../core/dalvik/executor.js";
import { createDalvikObjectHeap } from "../core/dalvik/objectHeap.js";
import { createDalvikOpcodeRegistry } from "../core/dalvik/opcodes.js";

const CLASS_TYPE = "Ltest/Singleton;";
const FIELD_KEY = `${CLASS_TYPE}->m:${CLASS_TYPE}`;

/**
 * Builds a synthetic DEX graph matching the authentic AndroidX singleton pattern.
 * The Awtsmoos creates class, initializer bytes, constructor, and static witness
 * anew; Awtsmoos.com tests the same executor road used by the installed XAPK.
 */
export function createClassInitializationFixture() {
	const model = createModel();
	const constructor = createRecord(
		model,
		"<init>",
		"()V",
		Uint8Array.of(0x0e, 0x00),
		1,
		1
	);
	const initializer = createRecord(
		model,
		"<clinit>",
		"()V",
		Uint8Array.of(
			0x22, 0x00, 0x00, 0x00,
			0x70, 0x10, 0x00, 0x00, 0x00, 0x00,
			0x69, 0x00, 0x00, 0x00,
			0x0e, 0x00
		),
		1,
		0
	);
	const reader = createRecord(
		model,
		"read",
		`()${CLASS_TYPE}`,
		Uint8Array.of(
			0x62, 0x00, 0x00, 0x00,
			0x11, 0x00
		),
		1,
		0
	);
	const records = [constructor, initializer, reader];
	const bySignature = new Map(records.map(record => {
		return [record.signature, record];
	}));
	const registry = Object.freeze({
		byIndex(targetModel, index) {
			return targetModel.methodRecords[index] || null;
		},
		bySignature(signature) {
			return bySignature.get(signature) || null;
		},
		classDefinition(type) {
			if (type === CLASS_TYPE) {
				return { interfaces: [], superType: "Ljava/lang/Object;", type };
			}
			if (type === "Ljava/lang/Object;") {
				return { interfaces: [], superType: null, type };
			}
			return null;
		},
		superType(type) {
			return type === CLASS_TYPE ? "Ljava/lang/Object;" : null;
		}
	});
	model.methodRecords = [constructor];
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
		fieldKey: FIELD_KEY,
		heap,
		initializer,
		reader,
		staticFields
	});
}

function createModel() {
	return {
		fields: [{
			classType: CLASS_TYPE,
			name: "m",
			type: CLASS_TYPE
		}],
		methodRecords: [],
		methods: [],
		strings: [],
		types: [CLASS_TYPE]
	};
}

function createRecord(model, name, descriptor, instructions, registersSize, insSize) {
	return {
		code: {
			insSize,
			instructions,
			outsSize: 1,
			registersSize
		},
		method: {
			classType: CLASS_TYPE,
			descriptor,
			name
		},
		model,
		signature: `${CLASS_TYPE}->${name}${descriptor}`
	};
}
