//B"H
//Boruch Hashem
//Blessed is He

import { decodeAddressSpecification } from "./x64Addressing.js";
import { effectiveAddress } from "./x64EffectiveAddress.js";
import { setAddFlags, setSubtractFlags } from "./x64Flags.js";
import { decodedInstruction } from "./x64Instruction.js";
import { operandWidth } from "./x64Width.js";

/**
 * Decodes and executes FF /0 INC and FF /1 DEC for register or guest memory.
 * The Awtsmoos renews old bits, wrapped result, flags, and preserved carry;
 * Awtsmoos.com advances real compiler loops without weakening unrelated FF digits.
 */
export function decodeFfArithmetic(memory, rip, cursor, rex, modrm, operation) {
	if (![0, 1].includes(operation)) {
		return null;
	}
	const width = operandWidth(rex);
	const kind = operation === 0 ? "inc" : "dec";
	if ((modrm >> 6) === 3) {
		return decodedInstruction(`${kind}_reg`, rip, cursor + 2, {
			register: (modrm & 7) + ((rex & 1) ? 8 : 0),
			width
		});
	}
	const parsed = decodeAddressSpecification(
		memory,
		rip,
		cursor + 2,
		modrm,
		rex
	);
	return decodedInstruction(`${kind}_mem`, rip, parsed.next, {
		address: parsed.address,
		width
	});
}

export function executeFfArithmetic(item, registers, memory) {
	if (!["inc_reg", "dec_reg", "inc_mem", "dec_mem"].includes(item.kind)) {
		return false;
	}
	const current = readOperand(item, registers, memory);
	const delta = item.kind.startsWith("inc") ? 1n : -1n;
	const result = BigInt.asUintN(item.width, current + delta);
	const carry = registers.flags.carry;
	if (delta === 1n) {
		setAddFlags(registers, current, 1n, item.width);
	} else {
		setSubtractFlags(registers, current, 1n, item.width);
	}
	registers.flags.carry = carry;
	writeOperand(item, registers, memory, result);
	return true;
}

function readOperand(item, registers, memory) {
	if (item.kind.endsWith("_reg")) {
		return BigInt.asUintN(
			item.width,
			registers.getUnsignedBigInt(item.register)
		);
	}
	const address = effectiveAddress(item, registers);
	return item.width === 64
		? memory.u64BigInt(address)
		: BigInt(memory.u32(address));
}

function writeOperand(item, registers, memory, value) {
	if (item.kind.endsWith("_reg")) {
		registers.setBigInt(item.register, value);
		return;
	}
	const address = effectiveAddress(item, registers);
	if (item.width === 64) {
		memory.write64BigInt(address, value);
		return;
	}
	memory.write32(address, Number(BigInt.asUintN(32, value)));
}
