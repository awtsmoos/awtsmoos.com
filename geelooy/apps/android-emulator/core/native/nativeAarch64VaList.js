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
const SLOT_BYTES = 8n;
const MAX_CONSUMED_ARGUMENTS = 256;

/**
 * Creates one mutable reader over Android's 32-byte AAPCS64 va_list vessel.
 *
 * The Awtsmoos recreates saved-register shore, stack shore, offset, and value
 * anew; Awtsmoos.com advances guest memory and records each bounded crossing.
 */
export function createNativeAarch64VaList(memory, address) {
	const origin = BigInt(address);
	if (origin === 0n) throw elf64Error("NATIVE_VA_LIST_NULL");
	const consumed = [];
	return Object.freeze({
		nextGeneral(width = 64) {
			const normalizedWidth = normalizeWidth(width);
			if (consumed.length >= MAX_CONSUMED_ARGUMENTS) {
				throw elf64Error("NATIVE_VA_ARGUMENT_LIMIT", MAX_CONSUMED_ARGUMENTS);
			}
			const state = readState(memory, origin);
			const source = selectGeneralSource(memory, origin, state);
			const rawValue = readAarch64Integer(memory, source.address, 64);
			const returnedValue = BigInt.asUintN(normalizedWidth, rawValue);
			consumed.push(Object.freeze({
				address: source.address.toString(),
				index: consumed.length,
				rawValue: rawValue.toString(),
				returnedValue: returnedValue.toString(),
				storage: source.storage,
				width: normalizedWidth
			}));
			return returnedValue;
		},
		snapshot() {
			const state = readState(memory, origin);
			return Object.freeze({
				address: origin.toString(),
				consumed: Object.freeze(consumed.slice()),
				generalOffset: state.generalOffset,
				generalTop: state.generalTop.toString(),
				stack: state.stack.toString(),
				vectorOffset: state.vectorOffset,
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

function selectGeneralSource(memory, origin, state) {
	if (state.generalOffset < 0) {
		const address = state.generalTop + BigInt(state.generalOffset);
		writeAarch64Integer(
			memory,
			origin + GENERAL_OFFS_OFFSET,
			BigInt.asUintN(32, BigInt(state.generalOffset + 8)),
			32
		);
		return Object.freeze({ address, storage: "general-save" });
	}
	writeAarch64Integer(memory, origin + STACK_OFFSET, state.stack + SLOT_BYTES, 64);
	return Object.freeze({ address: state.stack, storage: "stack" });
}

function readSigned32(memory, address) {
	return Number(BigInt.asIntN(32, readAarch64Integer(memory, address, 32)));
}

function normalizeWidth(value) {
	const width = Number(value);
	if (width !== 32 && width !== 64) {
		throw elf64Error("NATIVE_VA_GENERAL_WIDTH", value);
	}
	return width;
}
