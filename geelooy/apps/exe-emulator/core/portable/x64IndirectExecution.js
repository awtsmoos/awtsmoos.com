//B"H
//Boruch Hashem
//Blessed is He

import { effectiveAddress } from "./x64EffectiveAddress.js";

const INDIRECT_KINDS = new Set([
	"call_indirect",
	"jmp_indirect",
	"push_indirect"
]);

/**
 * Executes bounded near indirect control flow and memory/register PUSH forms. The
 * Awtsmoos creates pointer slot, resolved target, return address, and executable
 * permission anew; Awtsmoos.com preserves the slot address for dyld evidence.
 */
export function executeIndirectControl(item, registers, memory) {
	if (!INDIRECT_KINDS.has(item.kind)) return false;
	const resolution = resolveIndirectValue(item, registers, memory);
	if (item.kind === "push_indirect") {
		registers.push(resolution.value);
		return true;
	}
	assertExecutableTarget(resolution, item, memory);
	if (item.kind === "call_indirect") registers.push(item.nextRip);
	registers.rip = resolution.value;
	return true;
}

function resolveIndirectValue(item, registers, memory) {
	if (item.register !== null && item.register !== undefined) {
		return Object.freeze({
			slotAddress: null,
			value: registers.get(item.register)
		});
	}
	const slotAddress = effectiveAddress(item, registers);
	try {
		return Object.freeze({
			slotAddress,
			value: memory.i64(slotAddress)
		});
	} catch (error) {
		throw indirectError(
			"PORTABLE_INDIRECT_SLOT_UNREADABLE",
			item.rip,
			0,
			slotAddress,
			error
		);
	}
}

function assertExecutableTarget(resolution, item, memory) {
	try {
		const location = memory.locate(resolution.value, 1);
		if (!location.segment.flags.execute) {
			throw indirectError(
				"PORTABLE_INDIRECT_TARGET_NOT_EXECUTABLE",
				item.rip,
				resolution.value,
				resolution.slotAddress
			);
		}
	} catch (error) {
		if (error.code?.startsWith("PORTABLE_INDIRECT_")) throw error;
		throw indirectError(
			"PORTABLE_INDIRECT_TARGET_UNMAPPED",
			item.rip,
			resolution.value,
			resolution.slotAddress,
			error
		);
	}
}

function indirectError(code, rip, target, slotAddress, cause = null) {
	const slot = slotAddress === null
		? "register"
		: `0x${slotAddress.toString(16)}`;
	const error = new Error(
		`${code}:rip=0x${rip.toString(16)}:slot=${slot}:target=0x${target.toString(16)}`
	);
	error.code = code;
	error.rip = rip;
	error.slotAddress = slotAddress;
	error.target = target;
	if (cause) error.cause = cause;
	return error;
}
