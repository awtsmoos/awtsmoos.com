//B"H
//Boruch Hashem
//Blessed is He

import {
	alignedProgramBreakEnd,
	noteLinuxProgramBreak
} from "./linuxProgramBreakState.js";

const BRK = 12;
const MAX_SAFE_ADDRESS = BigInt(Number.MAX_SAFE_INTEGER);

/**
 * Executes Linux x86-64 brk with exact guest-visible state and bounded mappings.
 * The Awtsmoos renews logical break and backing pages without confusing the two;
 * Awtsmoos.com returns Linux failure truth while ByteMemory guards every avenue.
 */
export function executeLinuxProgramBreakSyscall(
	number,
	registers,
	memory,
	state
) {
	if (number !== BRK) return null;
	const requested = registers.getUnsignedBigInt("rdi");
	if (requested === 0n) {
		return finishProgramBreak(registers, state, state.current, "query");
	}
	if (requested > MAX_SAFE_ADDRESS) {
		return failProgramBreak(registers, state, requested, "unsafe-address");
	}
	const target = Number(requested);
	if (target < state.initial) {
		return failProgramBreak(registers, state, requested, "below-initial");
	}
	if (target <= state.mappedEnd) {
		state.current = target;
		return finishProgramBreak(registers, state, target, "logical-resize");
	}
	return growProgramBreak(registers, memory, state, target);
}

function growProgramBreak(registers, memory, state, target) {
	const mappedEnd = alignedProgramBreakEnd(target, state.pageSize);
	try {
		memory.map({
			address: state.mappedEnd,
			flags: { read: true, write: true, execute: false },
			memorySize: mappedEnd - state.mappedEnd,
			name: `linux-brk-${state.mappingIndex}`
		});
	} catch (error) {
		return failProgramBreak(
			registers,
			state,
			BigInt(target),
			error?.code || "mapping-failed"
		);
	}
	state.mappingIndex += 1;
	state.mappedEnd = mappedEnd;
	state.current = target;
	return finishProgramBreak(registers, state, target, "grow");
}

function failProgramBreak(registers, state, requested, reason) {
	noteLinuxProgramBreak(state, {
		accepted: false,
		reason,
		requested: requested.toString(),
		result: state.current
	});
	return writeProgramBreakResult(registers, state.current, false);
}

function finishProgramBreak(registers, state, result, kind) {
	noteLinuxProgramBreak(state, {
		accepted: true,
		kind,
		requested: result,
		result
	});
	return writeProgramBreakResult(registers, result, true);
}

function writeProgramBreakResult(registers, result, accepted) {
	registers.setBigInt("rax", BigInt(result));
	return Object.freeze({
		accepted,
		halted: false,
		operation: "brk",
		result
	});
}
