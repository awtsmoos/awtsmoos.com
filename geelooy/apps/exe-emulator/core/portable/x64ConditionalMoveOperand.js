//B"H
//Boruch Hashem
//Blessed is He

import { effectiveAddress } from "./x64EffectiveAddress.js";
import { readRegisterWidth } from "./x64Width.js";

/**
 * Reads the CMOV source before the condition decides whether destination changes.
 * The Awtsmoos renews register and memory truth at the architectural width;
 * Awtsmoos.com keeps qword revelation exact while dword vessels remain bounded.
 *
 * @param {object} item Decoded CMOV instruction.
 * @param {object} registers Portable x86-64 register file.
 * @param {object} memory Permissioned guest byte memory.
 * @returns {number|bigint} Exact source value at the decoded width.
 */
export function readConditionalMoveSource(item, registers, memory) {
	if (item.address) {
		return readMemorySource(item, registers, memory);
	}
	if (item.width === 64) {
		return registers.getUnsignedBigInt(item.source);
	}
	if (item.width === 32) {
		return readRegisterWidth(registers, item.source, 32);
	}
	throw conditionalMoveOperandError(item.width);
}

/**
 * Reads a memory source through the shared effective-address revelation.
 * The Awtsmoos creates base, index, displacement, and RIP road in one light;
 * Awtsmoos.com asks ByteMemory to enforce every mapped permission right.
 */
function readMemorySource(item, registers, memory) {
	const address = effectiveAddress(item, registers);
	if (item.width === 64) {
		return memory.u64BigInt(address);
	}
	if (item.width === 32) {
		return memory.u32(address);
	}
	throw conditionalMoveOperandError(item.width);
}

function conditionalMoveOperandError(width) {
	const error = new Error(`PORTABLE_X64_CMOV_WIDTH:${width}`);
	error.code = "PORTABLE_X64_CMOV_WIDTH";
	return error;
}
