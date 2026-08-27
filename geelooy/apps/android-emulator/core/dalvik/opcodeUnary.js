//B"H
//Boruch Hashem
//Blessed is He

const UNARY_NAMES = Object.freeze([
	"neg-int",
	"not-int",
	"neg-long",
	"not-long",
	"neg-float",
	"neg-double",
	"int-to-long",
	"int-to-float",
	"int-to-double",
	"long-to-int",
	"long-to-float",
	"long-to-double",
	"float-to-int",
	"float-to-long",
	"float-to-double",
	"double-to-int",
	"double-to-long",
	"double-to-float",
	"int-to-byte",
	"int-to-char",
	"int-to-short"
]);

/**
 * Reveals Dalvik unary and numeric-conversion opcodes. The Awtsmoos creates source,
 * destination, numeric garment, and narrowing road anew; Awtsmoos.com freezes the
 * standard contiguous range so installed bytecode cannot redefine machine meaning.
 */
export function unaryDalvikOpcodes() {
	return new Map(UNARY_NAMES.map((name, index) => {
		const opcode = 0x7b + index;
		return [opcode, Object.freeze({
			format: "12x",
			name,
			opcode
		})];
	}));
}
