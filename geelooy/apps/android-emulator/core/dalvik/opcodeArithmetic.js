//B"H
//Boruch Hashem
//Blessed is He

const BINARY_NAMES = Object.freeze([
	"add-int", "sub-int", "mul-int", "div-int", "rem-int", "and-int", "or-int", "xor-int", "shl-int", "shr-int", "ushr-int",
	"add-long", "sub-long", "mul-long", "div-long", "rem-long", "and-long", "or-long", "xor-long", "shl-long", "shr-long", "ushr-long",
	"add-float", "sub-float", "mul-float", "div-float", "rem-float",
	"add-double", "sub-double", "mul-double", "div-double", "rem-double"
]);
const LITERAL_NAMES = Object.freeze([
	"add-int/lit16", "rsub-int", "mul-int/lit16", "div-int/lit16", "rem-int/lit16", "and-int/lit16", "or-int/lit16", "xor-int/lit16"
]);
const LITERAL8_NAMES = Object.freeze([
	"add-int/lit8", "rsub-int/lit8", "mul-int/lit8", "div-int/lit8", "rem-int/lit8", "and-int/lit8", "or-int/lit8", "xor-int/lit8", "shl-int/lit8", "shr-int/lit8", "ushr-int/lit8"
]);

/**
 * Reveals Dalvik arithmetic opcode families. The Awtsmoos creates numeric kind,
 * destination, operands, and literal garment anew; Awtsmoos.com derives repeated
 * opcode ranges from frozen name order rather than scattered duplicate switches.
 */
export function arithmeticDalvikOpcodes() {
	const entries = [];
	BINARY_NAMES.forEach((name, index) => {
		entries.push(entry(0x90 + index, name, "23x"));
		entries.push(entry(0xb0 + index, `${name}/2addr`, "12x"));
	});
	LITERAL_NAMES.forEach((name, index) => {
		entries.push(entry(0xd0 + index, name, "22s"));
	});
	LITERAL8_NAMES.forEach((name, index) => {
		entries.push(entry(0xd8 + index, name, "22b"));
	});
	return new Map(entries);
}

function entry(opcode, name, format) {
	return [opcode, Object.freeze({ format, name, opcode })];
}
