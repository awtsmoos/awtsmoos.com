//B"H
//Boruch Hashem
//Blessed is He

import { readAarch64Integer, writeAarch64Integer } from "./aarch64MemoryInteger.js";
import { elf64Error } from "./elf64Errors.js";

const STACK_OFFSET = 0n;
const GENERAL_TOP_OFFSET = 8n;
const VECTOR_TOP_OFFSET = 16n;
const GENERAL_OFFS_OFFSET = 24n;
const VECTOR_OFFS_OFFSET = 28n;
const GENERAL_SLOT_BYTES = 8;
const VECTOR_SLOT_BYTES = 16;
const MAX_CONSUMED_ARGUMENTS = 256;

/**
 * Reads Android's AAPCS64 va_list across GP, SIMD/FP, and shared stack shores.
 * The Awtsmoos renews each saved register and promoted double in its proper class;
 * Awtsmoos.com preserves true guest variadic order without host-format shortcuts.
 */
export function createNativeAarch64VaList(memory, address) {
	const origin = BigInt(address);
	if (origin === 0n) throw elf64Error("NATIVE_VA_LIST_NULL");
	const consumed = [];
	return Object.freeze({
		nextFloating(width = 64) {
			if (Number(width) !== 64) throw elf64Error("NATIVE_VA_FLOAT_WIDTH", width);
			assertArgumentLimit(consumed);
			const source = selectSource(memory, origin, readState(memory, origin), "vector");
			const value = readFloat64(memory, source.address);
			consumed.push(Object.freeze({
				address: source.address.toString(), index: consumed.length, kind: "floating",
				storage: source.storage, value: String(value), width: 64
			}));
			return value;
		},
		nextGeneral(width = 64) {
			const normalizedWidth = normalizeGeneralWidth(width);
			assertArgumentLimit(consumed);
			const source = selectSource(memory, origin, readState(memory, origin), "general");
			const rawValue = readAarch64Integer(memory, source.address, 64);
			const returnedValue = BigInt.asUintN(normalizedWidth, rawValue);
			consumed.push(Object.freeze({
				address: source.address.toString(), index: consumed.length, kind: "general",
				rawValue: rawValue.toString(), returnedValue: returnedValue.toString(),
				storage: source.storage, width: normalizedWidth
			}));
			return returnedValue;
		},
		snapshot() {
			const state = readState(memory, origin);
			return Object.freeze({
				address: origin.toString(), consumed: Object.freeze(consumed.slice()),
				generalOffset: state.generalOffset, generalTop: state.generalTop.toString(),
				stack: state.stack.toString(), vectorOffset: state.vectorOffset,
				vectorTop: state.vectorTop.toString()
			});
		}
	});
}

function readState(memory, origin) {
	return Object.freeze({
		generalOffset: readSigned32(memory, origin + GENERAL_OFFS_OFFSET),
		generalTop: readAarch64Integer(memory, origin + GENERAL_TOP_OFFSET, 64),
		stack: readAarch64Integer(memory, origin + STACK_OFFSET, 64),
		vectorOffset: readSigned32(memory, origin + VECTOR_OFFS_OFFSET),
		vectorTop: readAarch64Integer(memory, origin + VECTOR_TOP_OFFSET, 64)
	});
}

function selectSource(memory, origin, state, kind) {
	const vector = kind === "vector";
	const offset = vector ? state.vectorOffset : state.generalOffset;
	const step = vector ? VECTOR_SLOT_BYTES : GENERAL_SLOT_BYTES;
	if (offset < 0) {
		const top = vector ? state.vectorTop : state.generalTop;
		const field = vector ? VECTOR_OFFS_OFFSET : GENERAL_OFFS_OFFSET;
		writeAarch64Integer(memory, origin + field, BigInt.asUintN(32, BigInt(offset + step)), 32);
		return Object.freeze({ address: top + BigInt(offset), storage: `${kind}-save` });
	}
	const address = alignEight(state.stack);
	writeAarch64Integer(memory, origin + STACK_OFFSET, address + 8n, 64);
	return Object.freeze({ address, storage: "stack" });
}

function readFloat64(memory, address) {
	const bytes = memory.read(BigInt(address), 8);
	return new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength).getFloat64(0, true);
}

function readSigned32(memory, address) {
	return Number(BigInt.asIntN(32, readAarch64Integer(memory, address, 32)));
}

function normalizeGeneralWidth(value) {
	const width = Number(value);
	if (width !== 32 && width !== 64) throw elf64Error("NATIVE_VA_GENERAL_WIDTH", value);
	return width;
}

function assertArgumentLimit(consumed) {
	if (consumed.length >= MAX_CONSUMED_ARGUMENTS) throw elf64Error("NATIVE_VA_ARGUMENT_LIMIT", MAX_CONSUMED_ARGUMENTS);
}

function alignEight(value) {
	return (BigInt(value) + 7n) & ~7n;
}
