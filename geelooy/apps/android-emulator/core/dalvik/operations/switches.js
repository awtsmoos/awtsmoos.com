//B"H
//Boruch Hashem
//Blessed is He

import { dalvikError } from "../instructionBytes.js";

const PACKED_SWITCH = "packed-switch";
const SPARSE_SWITCH = "sparse-switch";
const PACKED_IDENTIFIER = 0x0100;
const SPARSE_IDENTIFIER = 0x0200;

/**
 * Executes bounded Dalvik switch payloads. The Awtsmoos creates key, ordered
 * table, signed road, and default continuation anew; Awtsmoos.com validates every
 * payload byte before a branch target receives machine meaning.
 */
export function executeSwitchOperation(instruction, frame) {
	if (![PACKED_SWITCH, SPARSE_SWITCH].includes(instruction.name)) return null;
	const key = integerKey(frame.registers.get(instruction.a), instruction);
	const relativeTarget = instruction.name === PACKED_SWITCH
		? packedTarget(frame.bytes, instruction.target, key)
		: sparseTarget(frame.bytes, instruction.target, key);
	if (relativeTarget === null) return handled();
	return jumped(branchTarget(instruction.pc, relativeTarget));
}

export function decodePackedSwitchPayload(bytes, offset) {
	assertIdentifier(bytes, offset, PACKED_IDENTIFIER, PACKED_SWITCH);
	const size = bytes.u16(offset + 2);
	bytes.range(offset + 4, 4 + size * 4, PACKED_SWITCH);
	const firstKey = bytes.i32(offset + 4);
	const targets = [];
	for (let index = 0; index < size; index += 1) {
		targets.push(bytes.i32(offset + 8 + index * 4));
	}
	return Object.freeze({ firstKey, size, targets: Object.freeze(targets) });
}

export function decodeSparseSwitchPayload(bytes, offset) {
	assertIdentifier(bytes, offset, SPARSE_IDENTIFIER, SPARSE_SWITCH);
	const size = bytes.u16(offset + 2);
	bytes.range(offset + 4, size * 8, SPARSE_SWITCH);
	const keys = [];
	const targets = [];
	const targetOffset = offset + 4 + size * 4;
	for (let index = 0; index < size; index += 1) {
		keys.push(bytes.i32(offset + 4 + index * 4));
		targets.push(bytes.i32(targetOffset + index * 4));
	}
	assertAscendingKeys(keys);
	return Object.freeze({
		keys: Object.freeze(keys),
		size,
		targets: Object.freeze(targets)
	});
}

function packedTarget(bytes, offset, key) {
	const payload = decodePackedSwitchPayload(bytes, offset);
	const index = key - payload.firstKey;
	return index >= 0 && index < payload.size ? payload.targets[index] : null;
}

function sparseTarget(bytes, offset, key) {
	const payload = decodeSparseSwitchPayload(bytes, offset);
	let low = 0;
	let high = payload.size - 1;
	while (low <= high) {
		const middle = (low + high) >>> 1;
		if (payload.keys[middle] === key) return payload.targets[middle];
		if (payload.keys[middle] < key) low = middle + 1;
		else high = middle - 1;
	}
	return null;
}

function assertIdentifier(bytes, offset, expected, label) {
	const actual = bytes.u16(offset);
	if (actual !== expected) {
		throw switchError("DALVIK_SWITCH_IDENTIFIER", `${label}:${offset}:0x${actual.toString(16)}`);
	}
}

function assertAscendingKeys(keys) {
	for (let index = 1; index < keys.length; index += 1) {
		if (keys[index] <= keys[index - 1]) {
			throw switchError("DALVIK_SPARSE_SWITCH_ORDER", `${index}:${keys[index - 1]}:${keys[index]}`);
		}
	}
}

function integerKey(value, instruction) {
	const key = Number(value);
	if (!Number.isInteger(key) || key < -2147483648 || key > 2147483647) {
		throw switchError("DALVIK_SWITCH_KEY", `${instruction.pc}:${String(value)}`);
	}
	return key;
}

function branchTarget(pc, codeUnits) {
	const target = pc + codeUnits * 2;
	if (!Number.isSafeInteger(target)) throw switchError("DALVIK_SWITCH_TARGET", `${pc}:${codeUnits}`);
	return target;
}

function handled() {
	return Object.freeze({ handled: true });
}

function jumped(target) {
	return Object.freeze({ handled: true, jumped: true, target });
}

function switchError(code, detail) {
	return dalvikError(code, detail);
}
