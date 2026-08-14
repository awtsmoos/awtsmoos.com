//B"H
//Boruch Hashem
//Blessed is He

import { effectiveAddress } from "./x64EffectiveAddress.js";

/**
 * Executes BT, BTS, BTR, and BTC with exact register and memory bit strings.
 * The Awtsmoos renews original bit, carry, mutation, and cross-element road;
 * Awtsmoos.com changes only defined destinations while other flags keep their load.
 */
export function executeBitImmediate(item, registers, memory) {
	if (item.kind !== "bit_imm") {
		return false;
	}
	const target = resolveTarget(item, registers);
	const bits = readBits(item, target, registers, memory);
	const mask = 1n << BigInt(target.bitIndex);
	registers.flags.carry = (bits & mask) !== 0n;
	if (item.operation === "bt") {
		return true;
	}
	const result = modifyBits(bits, mask, item.operation);
	writeBits(item, target, result, registers, memory);
	return true;
}

function resolveTarget(item, registers) {
	if (item.targetKind === "register") {
		return {
			bitIndex: item.immediate % item.width,
			register: item.target
		};
	}
	const elementIndex = Math.floor(item.immediate / item.width);
	return {
		address: effectiveAddress(item, registers)
			+ elementIndex * (item.width / 8),
		bitIndex: item.immediate % item.width
	};
}

function readBits(item, target, registers, memory) {
	if (item.targetKind === "register") {
		return BigInt.asUintN(
			item.width,
			registers.getUnsignedBigInt(target.register)
		);
	}
	return item.width === 64
		? memory.u64BigInt(target.address)
		: BigInt(memory.u32(target.address));
}

function modifyBits(bits, mask, operation) {
	if (operation === "bts") return bits | mask;
	if (operation === "btr") return bits & ~mask;
	return bits ^ mask;
}

function writeBits(item, target, value, registers, memory) {
	const narrowed = BigInt.asUintN(item.width, value);
	if (item.targetKind === "register") {
		registers.setBigInt(target.register, narrowed);
		return;
	}
	if (item.width === 64) {
		memory.write64BigInt(target.address, narrowed);
		return;
	}
	memory.write32(target.address, Number(narrowed));
}
