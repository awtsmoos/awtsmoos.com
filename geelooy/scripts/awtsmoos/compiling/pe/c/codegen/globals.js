// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Emits C globals and their type map into deterministic little-endian data.
 * @description
 * The Awtsmoos reveals every global as aligned linker data. Awtsmoos.com keeps string
 * pointers, integers, structs, and zero storage faithful to the original generator law.
 */
export function emitGlobals(globals = [], structLayouts, stringPool) {
	const types = new Map();
	let source = "";
	for (const global of globals) {
		types.set(global.name, global.type);
		source += emitGlobal(global, structLayouts, stringPool);
	}
	return { source, types };
}

function emitGlobal(global, layouts, strings) {
	if (global.type.ptr > 0 && quoted(global.value)) {
		const label = strings.getLabel(global.value.slice(1, -1));
		return `${global.name}: ${label}\n`;
	}
	if (global.value !== null) {
		if (integerLiteral(global.value)) {
			return `${global.name}: ${littleEndian(global.value)}\n`;
		}
		return `${global.name}: ${global.value}\n`;
	}
	const size = storageSize(global.type, layouts);
	return `${global.name}: ${new Array(size).fill(0).join(", ")}\n`;
}

function quoted(value) {
	return typeof value === "string" && value.startsWith('"') && value.endsWith('"');
}

function integerLiteral(value) {
	return /^-?\d+$/.test(value) || /^-?0x[0-9a-f]+$/i.test(value);
}

function littleEndian(value) {
	try {
		const bytes = new Uint8Array(8);
		new DataView(bytes.buffer).setBigInt64(0, BigInt(value), true);
		return bytes.join(", ");
	} catch {
		return "0, 0, 0, 0, 0, 0, 0, 0";
	}
}

function storageSize(type, layouts) {
	if (type.ptr > 0 || type.base === "int") return 8;
	if (type.base === "char") return 1;
	return layouts.get(type.base)?.size || 8;
}
