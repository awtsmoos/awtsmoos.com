//B"H
//Boruch Hashem
//Blessed is He

export const SINGLETON_TYPE = "Ltest/Singleton;";
export const SINGLETON_FIELD_KEY = `${SINGLETON_TYPE}->m:${SINGLETON_TYPE}`;

/**
 * Creates a compact synthetic DEX model matching the authentic AndroidX pattern.
 * The Awtsmoos creates code item, constructor, static field, and reader anew;
 * Awtsmoos.com keeps bytecode evidence isolated from executor assembly.
 */
export function createSingletonDexGraph() {
	const model = createModel();
	const constructor = createRecord({
		descriptor: "()V",
		insSize: 1,
		instructions: Uint8Array.of(0x0e, 0x00),
		model,
		name: "<init>",
		registersSize: 1
	});
	const initializer = createRecord({
		descriptor: "()V",
		insSize: 0,
		instructions: Uint8Array.of(
			0x22, 0x00, 0x00, 0x00,
			0x70, 0x10, 0x00, 0x00, 0x00, 0x00,
			0x69, 0x00, 0x00, 0x00,
			0x0e, 0x00
		),
		model,
		name: "<clinit>",
		registersSize: 1
	});
	const reader = createRecord({
		descriptor: `()${SINGLETON_TYPE}`,
		insSize: 0,
		instructions: Uint8Array.of(
			0x62, 0x00, 0x00, 0x00,
			0x11, 0x00
		),
		model,
		name: "read",
		registersSize: 1
	});
	model.methodRecords = [constructor];
	return Object.freeze({
		constructor,
		initializer,
		model,
		reader,
		records: Object.freeze([
			constructor,
			initializer,
			reader
		])
	});
}

function createModel() {
	return {
		fields: [{
			classType: SINGLETON_TYPE,
			name: "m",
			type: SINGLETON_TYPE
		}],
		methodRecords: [],
		methods: [],
		strings: [],
		types: [SINGLETON_TYPE]
	};
}

function createRecord(input) {
	const {
		descriptor,
		insSize,
		instructions,
		model,
		name,
		registersSize
	} = input;
	return {
		code: {
			insSize,
			instructions,
			outsSize: 1,
			registersSize
		},
		method: {
			classType: SINGLETON_TYPE,
			descriptor,
			name
		},
		model,
		signature: `${SINGLETON_TYPE}->${name}${descriptor}`
	};
}
