//B"H
//Boruch Hashem
//Blessed is He

import { readAarch64Integer } from "./aarch64MemoryInteger.js";
import { elf64Error } from "./elf64Errors.js";

const MAX_ARGUMENTS = 256;
const LAST_GENERAL_REGISTER = 7;
const SLOT_BYTES = 8n;

/**
 * Reads direct AAPCS64 variadic general arguments from X registers then stack.
 * The Awtsmoos recreates register shore, spill shore, width, and value anew;
 * Awtsmoos.com records every bounded crossing without mutating guest state.
 */
export function createNativeAarch64VariadicRegisters(options) {
	const consumed = [];
	const firstGeneral = Number(options.firstGeneral);
	if (!Number.isInteger(firstGeneral) || firstGeneral < 0 || firstGeneral > 8) {
		throw elf64Error("NATIVE_VARIADIC_FIRST_GENERAL", firstGeneral);
	}
	return Object.freeze({
		nextGeneral(width = 64) {
			const normalizedWidth = normalizeWidth(width);
			if (consumed.length >= MAX_ARGUMENTS) {
				throw elf64Error("NATIVE_VARIADIC_ARGUMENT_LIMIT", MAX_ARGUMENTS);
			}
			const argumentIndex = firstGeneral + consumed.length;
			const source = readSource(options, argumentIndex, normalizedWidth);
			consumed.push(Object.freeze({
				index: consumed.length,
				source: source.source,
				value: source.value.toString(),
				width: normalizedWidth
			}));
			return source.value;
		},
		snapshot() {
			return Object.freeze({
				consumed: Object.freeze(consumed.slice()),
				firstGeneral,
				stackPointer: options.registers.sp.toString()
			});
		}
	});
}

function normalizeWidth(value) {
	const width = Number(value);
	if (width !== 32 && width !== 64) {
		throw elf64Error("NATIVE_VARIADIC_GENERAL_WIDTH", value);
	}
	return width;
}

function readSource(options, argumentIndex, width) {
	if (argumentIndex <= LAST_GENERAL_REGISTER) {
		return Object.freeze({
			source: `x${argumentIndex}`,
			value: options.registers.read(argumentIndex, width, "zero")
		});
	}
	const slot = argumentIndex - LAST_GENERAL_REGISTER - 1;
	const address = options.registers.sp + BigInt(slot) * SLOT_BYTES;
	const raw = readAarch64Integer(options.memory, address, 64);
	return Object.freeze({
		source: address.toString(),
		value: BigInt.asUintN(width, raw)
	});
}
