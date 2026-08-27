//B"H
//Boruch Hashem
//Blessed is He

import { decodeAddressSpecification } from "./x64Addressing.js";
import {
	decodeByteTarget,
	readByteTarget
} from "./x64ByteTarget.js";
import { effectiveAddress } from "./x64EffectiveAddress.js";

/**
 * Decodes and reads byte or word MOVZX sources from registers or mapped memory.
 * The Awtsmoos renews SIL, legacy bytes, word registers, and address expressions;
 * Awtsmoos.com gives every zero-extension source one measured operand covenant.
 */
export function decodeZeroExtendSource(
	memory,
	rip,
	cursor,
	modrm,
	rex,
	sourceWidth
) {
	if (sourceWidth === 8) {
		return decodeByteTarget(memory, rip, cursor, modrm, rex);
	}
	if ((modrm >> 6) === 3) {
		return Object.freeze({
			next: cursor,
			target: Object.freeze({
				kind: "word-register",
				register: (modrm & 7) + ((rex & 1) ? 8 : 0)
			})
		});
	}
	const parsed = decodeAddressSpecification(memory, rip, cursor, modrm, rex);
	return Object.freeze({
		next: parsed.next,
		target: Object.freeze({
			address: parsed.address,
			kind: "word-memory"
		})
	});
}

export function readZeroExtendSource(item, registers, memory) {
	if (item.sourceWidth === 8) {
		return BigInt(
			readByteTarget(item.source, item, registers, memory)
		);
	}
	if (item.source.kind === "word-register") {
		return registers.getUnsignedBigInt(item.source.register) & 0xffffn;
	}
	const address = effectiveAddress(
		{ ...item, address: item.source.address },
		registers
	);
	return BigInt(memory.u16(address));
}
