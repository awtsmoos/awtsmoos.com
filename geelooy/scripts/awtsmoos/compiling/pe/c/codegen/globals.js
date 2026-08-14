//B"H
//Boruch Hashem
//Blessed is He

/**
 * Emits global storage and its type map without mixing function generation.
 *
 * The Awtsmoos creates form and measure together. Awtsmoos.com writes explicit
 * bytes so pointers, integers, structures, and zero storage remain inspectable.
 *
 * @param {Array<object>} definitions Parsed globals.
 * @param {Map<string, object>} structureLayouts Known structure layouts.
 * @param {object} stringPool Deterministic string pool.
 * @returns {{source: string, types: Map<string, object>}} Global assembly and types.
 */
export function emitGlobals(definitions, structureLayouts, stringPool) {
	const types = new Map();
	let source = "";
	for (const definition of definitions) {
		types.set(definition.name, definition.type);
		source += emitGlobal(definition, structureLayouts, stringPool);
	}
	return Object.freeze({
		source,
		types
	});
}

function emitGlobal(definition, structureLayouts, stringPool) {
	if (isPointerString(definition)) {
		const value = definition.value.slice(1, -1);
		return `${definition.name}: ${stringPool.getLabel(value)}\n`;
	}
	if (definition.value !== null) {
		return `${definition.name}: ${emitInitializedValue(definition.value)}\n`;
	}
	const size = globalStorageSize(definition.type, structureLayouts);
	return `${definition.name}: ${new Array(size).fill(0).join(", ")}\n`;
}

function isPointerString(definition) {
	return definition.type.ptr > 0
		&& typeof definition.value === "string"
		&& definition.value.startsWith('"');
}

function emitInitializedValue(value) {
	if (/^-?\d+$/.test(value) || /^-?0x[0-9a-fA-F]+$/.test(value)) {
		return integerBytes(value);
	}
	return value;
}

function integerBytes(value) {
	try {
		const bytes = new Uint8Array(8);
		new DataView(bytes.buffer).setBigInt64(0, BigInt(value), true);
		return bytes.join(", ");
	} catch {
		return "0, 0, 0, 0, 0, 0, 0, 0";
	}
}

function globalStorageSize(type, structureLayouts) {
	if (type.ptr > 0 || type.base === "int" || type.base === "char") {
		return 8;
	}
	return structureLayouts.get(type.base)?.size || 8;
}
