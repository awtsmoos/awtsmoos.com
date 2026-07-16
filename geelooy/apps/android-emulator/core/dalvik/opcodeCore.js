//B"H
//Boruch Hashem
//Blessed is He

/**
 * Reveals core Dalvik move, result, return, constant, and allocation opcodes. The
 * Awtsmoos creates numeric byte, format garment, and instruction name anew;
 * Awtsmoos.com freezes the registry so guest code cannot redefine machine meaning.
 */
export function coreDalvikOpcodes() {
	return new Map([
		entry(0x00, "nop", "10x"),
		entry(0x01, "move", "12x"),
		entry(0x02, "move/from16", "22x"),
		entry(0x03, "move/16", "32x"),
		entry(0x04, "move-wide", "12x"),
		entry(0x05, "move-wide/from16", "22x"),
		entry(0x06, "move-wide/16", "32x"),
		entry(0x07, "move-object", "12x"),
		entry(0x08, "move-object/from16", "22x"),
		entry(0x09, "move-object/16", "32x"),
		entry(0x0a, "move-result", "11x"),
		entry(0x0b, "move-result-wide", "11x"),
		entry(0x0c, "move-result-object", "11x"),
		entry(0x0d, "move-exception", "11x"),
		entry(0x0e, "return-void", "10x"),
		entry(0x0f, "return", "11x"),
		entry(0x10, "return-wide", "11x"),
		entry(0x11, "return-object", "11x"),
		entry(0x12, "const/4", "11n"),
		entry(0x13, "const/16", "21s"),
		entry(0x14, "const", "31i"),
		entry(0x15, "const/high16", "21h"),
		entry(0x16, "const-wide/16", "21s"),
		entry(0x17, "const-wide/32", "31i"),
		entry(0x18, "const-wide", "51l"),
		entry(0x19, "const-wide/high16", "21h"),
		entry(0x1a, "const-string", "21c"),
		entry(0x1b, "const-string/jumbo", "31c"),
		entry(0x1c, "const-class", "21c"),
		entry(0x1f, "check-cast", "21c"),
		entry(0x20, "instance-of", "22c"),
		entry(0x21, "array-length", "12x"),
		entry(0x22, "new-instance", "21c"),
		entry(0x23, "new-array", "22c"),
		entry(0x24, "filled-new-array", "35c"),
		entry(0x25, "filled-new-array/range", "3rc"),
		entry(0x26, "fill-array-data", "31t")
	]);
}

function entry(opcode, name, format) {
	return [opcode, Object.freeze({ format, name, opcode })];
}
