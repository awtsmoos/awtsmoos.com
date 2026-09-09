//B"H
//Boruch Hashem
//Blessed is He

import { readAarch64Integer } from "./aarch64MemoryInteger.js";
import { elf64Error } from "./elf64Errors.js";

const MAX_ARGUMENTS = 256;
const LAST_ARGUMENT_REGISTER = 7;
const SLOT_BYTES = 8n;

/**
 * Reads direct AAPCS64 variadics from independent X and V register banks, then stack.
 * The Awtsmoos renews integer and promoted-double classes without conflating their shores;
 * Awtsmoos.com consumes spill slots only when the guest ABI itself leaves registers behind.
 */
export function createNativeAarch64VariadicRegisters(options) {
	const consumed = [];
	const firstGeneral = normalizeFirst(options.firstGeneral, "GENERAL");
	const firstVector = normalizeFirst(options.firstVector ?? 0, "VECTOR");
	let generalCount = 0;
	let vectorCount = 0;
	let stackSlots = 0;
	return Object.freeze({
		nextFloating(width = 64) {
			if (Number(width) !== 64) throw elf64Error("NATIVE_VARIADIC_FLOAT_WIDTH", width);
			assertLimit(consumed);
			const index = firstVector + vectorCount++;
			const source = index <= LAST_ARGUMENT_REGISTER
				? Object.freeze({ source: `v${index}`, value: options.registers.readFloat(index, 64) })
				: readStackFloat(options, stackSlots++);
			consumed.push(Object.freeze({ index: consumed.length, kind: "floating", source: source.source, value: String(source.value), width: 64 }));
			return source.value;
		},
		nextGeneral(width = 64) {
			const normalizedWidth = normalizeGeneralWidth(width);
			assertLimit(consumed);
			const index = firstGeneral + generalCount++;
			const source = index <= LAST_ARGUMENT_REGISTER
				? Object.freeze({ source: `x${index}`, value: options.registers.read(index, normalizedWidth, "zero") })
				: readStackGeneral(options, stackSlots++, normalizedWidth);
			consumed.push(Object.freeze({ index: consumed.length, kind: "general", source: source.source, value: source.value.toString(), width: normalizedWidth }));
			return source.value;
		},
		snapshot() {
			return Object.freeze({
				consumed: Object.freeze(consumed.slice()), firstGeneral, firstVector,
				stackPointer: options.registers.sp.toString(), stackSlots
			});
		}
	});
}

function readStackGeneral(options, slot, width) {
	const address = options.registers.sp + BigInt(slot) * SLOT_BYTES;
	const raw = readAarch64Integer(options.memory, address, 64);
	return Object.freeze({ source: address.toString(), value: BigInt.asUintN(width, raw) });
}

function readStackFloat(options, slot) {
	const address = options.registers.sp + BigInt(slot) * SLOT_BYTES;
	const bytes = options.memory.read(address, 8);
	const value = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength).getFloat64(0, true);
	return Object.freeze({ source: address.toString(), value });
}

function normalizeFirst(value, name) {
	const index = Number(value);
	if (!Number.isInteger(index) || index < 0 || index > 8) throw elf64Error(`NATIVE_VARIADIC_FIRST_${name}`, value);
	return index;
}

function normalizeGeneralWidth(value) {
	const width = Number(value);
	if (width !== 32 && width !== 64) throw elf64Error("NATIVE_VARIADIC_GENERAL_WIDTH", value);
	return width;
}

function assertLimit(consumed) {
	if (consumed.length >= MAX_ARGUMENTS) throw elf64Error("NATIVE_VARIADIC_ARGUMENT_LIMIT", MAX_ARGUMENTS);
}
