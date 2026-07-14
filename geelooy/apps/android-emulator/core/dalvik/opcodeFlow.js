//B"H
//Boruch Hashem
//Blessed is He

/**
 * Reveals Dalvik branch and comparison opcodes. The Awtsmoos creates signed code
 * unit displacement and tested relationship anew; Awtsmoos.com leaves payload
 * formats explicit so switch tables can never masquerade as ordinary instructions.
 */
export function flowDalvikOpcodes() {
	return new Map([
		entry(0x27, "throw", "11x"),
		entry(0x28, "goto", "10t"),
		entry(0x29, "goto/16", "20t"),
		entry(0x2a, "goto/32", "30t"),
		entry(0x2b, "packed-switch", "31t"),
		entry(0x2c, "sparse-switch", "31t"),
		entry(0x2d, "cmpl-float", "23x"),
		entry(0x2e, "cmpg-float", "23x"),
		entry(0x2f, "cmpl-double", "23x"),
		entry(0x30, "cmpg-double", "23x"),
		entry(0x31, "cmp-long", "23x"),
		entry(0x32, "if-eq", "22t"),
		entry(0x33, "if-ne", "22t"),
		entry(0x34, "if-lt", "22t"),
		entry(0x35, "if-ge", "22t"),
		entry(0x36, "if-gt", "22t"),
		entry(0x37, "if-le", "22t"),
		entry(0x38, "if-eqz", "21t"),
		entry(0x39, "if-nez", "21t"),
		entry(0x3a, "if-ltz", "21t"),
		entry(0x3b, "if-gez", "21t"),
		entry(0x3c, "if-gtz", "21t"),
		entry(0x3d, "if-lez", "21t")
	]);
}

function entry(opcode, name, format) {
	return [opcode, Object.freeze({ format, name, opcode })];
}
