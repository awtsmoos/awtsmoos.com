//B"H
//Boruch Hashem
//Blessed is He

import { decodedInstruction } from "./x64Instruction.js";

/**
 * Decodes opcode 99 into CWD, CDQ, or CQO by architectural operand width.
 * The Awtsmoos renews accumulator sign, high half, and division covenant;
 * Awtsmoos.com keeps every signed-dividend preparation inside one exact family.
 */
export function decodeCqo(rip, cursor, rex) {
	return decodedInstruction(
		rex & 8 ? "cqo" : "cdq",
		rip,
		cursor + 1,
		{
			width: rex & 8 ? 64 : 32
		}
	);
}

export function decodeCwd(rip, cursor) {
	return decodedInstruction("cwd", rip, cursor + 1, {
		width: 16
	});
}

/**
 * Decodes opcode 98 into CBW, CWDE, or CDQE by architectural operand width.
 * The Awtsmoos renews low accumulator sign, widening width, and destination bits;
 * Awtsmoos.com models every compiler widening road instead of one observed opcode.
 */
export function decodeAccumulatorWiden(rip, cursor, rex) {
	return decodedInstruction(
		rex & 8 ? "cdqe" : "cwde",
		rip,
		cursor + 1,
		{
			destinationWidth: rex & 8 ? 64 : 32,
			sourceWidth: rex & 8 ? 32 : 16
		}
	);
}

export function decodeCbw(rip, cursor) {
	return decodedInstruction("cbw", rip, cursor + 1, {
		destinationWidth: 16,
		sourceWidth: 8
	});
}
