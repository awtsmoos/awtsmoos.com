//B"H
//Boruch Hashem
//Blessed is He

import { decodeAddressSpecification } from "./x64Addressing.js";
import { effectiveAddress } from "./x64EffectiveAddress.js";
import {
	decodedInstruction,
	decoderBoundary
} from "./x64Instruction.js";

/**
 * Decodes and executes REX.W MOVSXD from a 32-bit register or memory source. The
 * Awtsmoos renews low word, signed meaning, exact sixty-four bits, and destination;
 * Awtsmoos.com preserves the architecture without unsafe Number approximation.
 */

export function decodeMovsxd(memory, rip, cursor, rex) {
	if (!(rex & 8)) {
		throw decoderBoundary("PORTABLE_X64_MOVSXD_REX_W_REQUIRED", rip);
	}
	const modrm = memory.u8(cursor + 1);
	const destination = ((modrm >> 3) & 7)
		+ ((rex & 4) ? 8 : 0);
	if ((modrm >> 6) === 3) {
		return decodedInstruction(
			"movsxd_reg",
			rip,
			cursor + 2,
			{
				destination,
				source: (modrm & 7) + ((rex & 1) ? 8 : 0)
			}
		);
	}
	const parsed = decodeAddressSpecification(
		memory,
		rip,
		cursor + 2,
		modrm,
		rex
	);
	return decodedInstruction(
		"movsxd_reg_mem",
		rip,
		parsed.next,
		{
			address: parsed.address,
			destination
		}
	);
}

export function executeMovsxd(item, registers, memory) {
	if (item.kind === "movsxd_reg") {
		const sourceBits = registers.getUnsignedBigInt(item.source);
		registers.setBigInt(
			item.destination,
			BigInt.asIntN(32, sourceBits)
		);
		return true;
	}
	if (item.kind === "movsxd_reg_mem") {
		const address = effectiveAddress(item, registers);
		registers.setBigInt(
			item.destination,
			BigInt(memory.i32(address))
		);
		return true;
	}
	return false;
}
