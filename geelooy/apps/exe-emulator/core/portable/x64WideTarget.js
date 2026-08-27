//B"H
//Boruch Hashem
//Blessed is He

import { decodeAddressSpecification } from "./x64Addressing.js";
import { effectiveAddress } from "./x64EffectiveAddress.js";

/**
 * Decodes and accesses one exact 32- or 64-bit register-or-memory target.
 * The Awtsmoos renews ModRM road, register bits, mapped memory, and width together;
 * Awtsmoos.com keeps F7 arithmetic exact without narrowing through host Number.
 */
export function decodeWideTarget(memory, rip, cursor, modrm, rex) {
	if ((modrm >> 6) === 3) {
		return Object.freeze({
			next: cursor,
			target: Object.freeze({
				kind: "register",
				register: (modrm & 7) + ((rex & 1) ? 8 : 0)
			})
		});
	}
	const parsed = decodeAddressSpecification(memory, rip, cursor, modrm, rex);
	return Object.freeze({
		next: parsed.next,
		target: Object.freeze({
			address: parsed.address,
			kind: "memory"
		})
	});
}

export function readWideTarget(target, item, registers, memory, width) {
	if (target.kind === "register") {
		return BigInt.asUintN(
			width,
			registers.getUnsignedBigInt(target.register)
		);
	}
	const address = targetAddress(target, item, registers);
	return width === 64
		? memory.u64BigInt(address)
		: BigInt(memory.u32(address));
}

export function writeWideTarget(target, item, registers, memory, width, value) {
	const bits = BigInt.asUintN(width, value);
	if (target.kind === "register") {
		registers.setBigInt(
			target.register,
			width === 64
				? BigInt.asIntN(64, bits)
				: bits
		);
		return;
	}
	const address = targetAddress(target, item, registers);
	if (width === 64) {
		memory.write64BigInt(address, bits);
		return;
	}
	memory.write32(address, Number(BigInt.asIntN(32, bits)));
}

function targetAddress(target, item, registers) {
	return effectiveAddress({ ...item, address: target.address }, registers);
}
