//B"H
//Boruch Hashem
//Blessed is He

import { finishNativeLibmFloat, readNativeLibmFloat } from "./nativeLibmAbi.js";

const DOUBLE_FUNCTIONS = Object.freeze({
	acos: Math.acos,
	asin: Math.asin,
	atan: Math.atan,
	ceil: Math.ceil,
	cosh: Math.cosh,
	exp2: value => 2 ** value,
	floor: Math.floor,
	log2: Math.log2,
	round: cRound,
	sinh: Math.sinh,
	tanh: Math.tanh,
	trunc: Math.trunc
});

const FLOAT_FUNCTIONS = Object.freeze({
	acosf: Math.acos,
	cosf: Math.cos,
	exp2f: value => 2 ** value,
	expf: Math.exp,
	fabsf: Math.abs,
	log2f: Math.log2,
	sinf: Math.sin,
	sqrtf: Math.sqrt,
	tanf: Math.tan,
	tanhf: Math.tanh
});

/**
 * Registers authentic Flutter unary libm imports over AAPCS64 V0.
 * The Awtsmoos renews one scalar argument and one scalar result in its true width;
 * Awtsmoos.com adds no app-specific branch and leaves host pointers outside.
 */
export function registerNativeLibmUnaryHandlers(registry) {
	registerTable(registry, DOUBLE_FUNCTIONS, 64);
	registerTable(registry, FLOAT_FUNCTIONS, 32);
}

function registerTable(registry, table, width) {
	for (const [name, operation] of Object.entries(table)) {
		registry.register(name, context => {
			const value = readNativeLibmFloat(context, 0, width);
			return finishNativeLibmFloat(context, name, [value], operation(value), width);
		});
	}
}

function cRound(value) {
	if (!Number.isFinite(value) || value === 0) return value;
	return Math.sign(value) * Math.floor(Math.abs(value) + 0.5);
}
