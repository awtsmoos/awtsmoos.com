//B"H
//Boruch Hashem
//Blessed is He

/**
 * Reveals Dalvik array, field, static, and invocation opcodes. The Awtsmoos creates
 * owner, member index, argument word, and dispatch garment anew; Awtsmoos.com keeps
 * range and fixed-register invokes distinct so call evidence remains reconstructable.
 */
export function memberDalvikOpcodes() {
	const entries = [];
	for (let opcode = 0x44; opcode <= 0x4a; opcode += 1) {
		entries.push(entry(opcode, arrayName("aget", opcode - 0x44), "23x"));
	}
	for (let opcode = 0x4b; opcode <= 0x51; opcode += 1) {
		entries.push(entry(opcode, arrayName("aput", opcode - 0x4b), "23x"));
	}
	for (let opcode = 0x52; opcode <= 0x58; opcode += 1) {
		entries.push(entry(opcode, fieldName("iget", opcode - 0x52), "22c"));
	}
	for (let opcode = 0x59; opcode <= 0x5f; opcode += 1) {
		entries.push(entry(opcode, fieldName("iput", opcode - 0x59), "22c"));
	}
	for (let opcode = 0x60; opcode <= 0x66; opcode += 1) {
		entries.push(entry(opcode, fieldName("sget", opcode - 0x60), "21c"));
	}
	for (let opcode = 0x67; opcode <= 0x6d; opcode += 1) {
		entries.push(entry(opcode, fieldName("sput", opcode - 0x67), "21c"));
	}
	entries.push(
		entry(0x6e, "invoke-virtual", "35c"),
		entry(0x6f, "invoke-super", "35c"),
		entry(0x70, "invoke-direct", "35c"),
		entry(0x71, "invoke-static", "35c"),
		entry(0x72, "invoke-interface", "35c"),
		entry(0x74, "invoke-virtual/range", "3rc"),
		entry(0x75, "invoke-super/range", "3rc"),
		entry(0x76, "invoke-direct/range", "3rc"),
		entry(0x77, "invoke-static/range", "3rc"),
		entry(0x78, "invoke-interface/range", "3rc")
	);
	return new Map(entries);
}

function arrayName(prefix, index) {
	return `${prefix}${suffix(index)}`;
}

function fieldName(prefix, index) {
	return `${prefix}${suffix(index)}`;
}

function suffix(index) {
	return ["", "-wide", "-object", "-boolean", "-byte", "-char", "-short"][index];
}

function entry(opcode, name, format) {
	return [opcode, Object.freeze({ format, name, opcode })];
}
