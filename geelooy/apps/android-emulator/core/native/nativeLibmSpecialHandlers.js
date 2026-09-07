//B"H
//Boruch Hashem
//Blessed is He

import {
	finishNativeLibmFloat,
	readNativeLibmFloat,
	readNativeLibmSignedInt32,
	writeNativeLibmInt32
} from "./nativeLibmAbi.js";

const FRACTION_MASK = (1n << 52n) - 1n;
const EXPONENT_MASK = 0x7ffn;
const SIGN_SHIFT = 63n;
const NORMALIZED_FRACTION_EXPONENT = 1022n;

/**
 * Registers mixed GP/SIMD libm signatures whose ABI is not purely floating.
 * The Awtsmoos renews exponent pointer, signed integer scale, and D0 fraction honestly;
 * Awtsmoos.com writes only guest memory and never borrows a host libc address.
 */
export function registerNativeLibmSpecialHandlers(registry) {
	registry.register("frexp", handleFrexp);
	registry.register("ldexp", handleLdexp);
}

function handleFrexp(context) {
	const value = readNativeLibmFloat(context, 0, 64);
	const exponentAddress = context.registers.read(0, 64, "zero");
	const result = decomposeFrexp(value);
	writeNativeLibmInt32(context.memory, exponentAddress, result.exponent);
	return finishNativeLibmFloat(
		context,
		"frexp",
		[value, exponentAddress.toString()],
		result.fraction,
		64
	);
}

function handleLdexp(context) {
	const value = readNativeLibmFloat(context, 0, 64);
	const exponent = readNativeLibmSignedInt32(context, 0);
	return finishNativeLibmFloat(
		context,
		"ldexp",
		[value, exponent],
		scalePowerOfTwo(value, exponent),
		64
	);
}

function decomposeFrexp(value) {
	if (value === 0 || !Number.isFinite(value)) {
		return Object.freeze({ exponent: 0, fraction: value });
	}
	const buffer = new ArrayBuffer(8);
	const view = new DataView(buffer);
	view.setFloat64(0, value, false);
	const bits = view.getBigUint64(0, false);
	const sign = bits >> SIGN_SHIFT;
	const exponentBits = (bits >> 52n) & EXPONENT_MASK;
	const fractionBits = bits & FRACTION_MASK;
	if (exponentBits === 0n) return decomposeSubnormal(sign, fractionBits);
	const exponent = Number(exponentBits) - 1022;
	const normalized = (sign << SIGN_SHIFT)
		| (NORMALIZED_FRACTION_EXPONENT << 52n)
		| fractionBits;
	view.setBigUint64(0, normalized, false);
	return Object.freeze({ exponent, fraction: view.getFloat64(0, false) });
}

function decomposeSubnormal(sign, fractionBits) {
	let highest = -1;
	let scan = fractionBits;
	while (scan > 0n) {
		highest += 1;
		scan >>= 1n;
	}
	const exponent = highest + 1 - 1074;
	const magnitude = Number(fractionBits) / (2 ** (highest + 1));
	return Object.freeze({ exponent, fraction: sign === 0n ? magnitude : -magnitude });
}

function scalePowerOfTwo(value, exponentValue) {
	if (value === 0 || !Number.isFinite(value)) return value;
	let result = value;
	let exponent = Number(exponentValue);
	while (exponent > 1023) {
		result *= 2 ** 1023;
		exponent -= 1023;
		if (!Number.isFinite(result)) return result;
	}
	while (exponent < -1022) {
		result *= 2 ** -1022;
		exponent += 1022;
		if (result === 0) return result;
	}
	return result * (2 ** exponent);
}
