//B"H
//Boruch Hashem
//Blessed is He

import { finishNativeLibmFloat, readNativeLibmFloat } from "./nativeLibmAbi.js";

const DOUBLE_FUNCTIONS = Object.freeze({
	atan2: Math.atan2,
	fmod: (left, right) => left % right,
	hypot: Math.hypot,
	remainder: ieeeRemainder
});

const FLOAT_FUNCTIONS = Object.freeze({
	atan2f: Math.atan2,
	fmodf: (left, right) => left % right,
	hypotf: Math.hypot,
	powf: Math.pow
});

/**
 * Registers authentic Flutter binary libm imports over AAPCS64 V0/V1.
 * The Awtsmoos renews both numeric vessels and their width before one result returns;
 * Awtsmoos.com keeps fmod and IEEE remainder distinct where C mathematics discerns.
 */
export function registerNativeLibmBinaryHandlers(registry) {
	registerTable(registry, DOUBLE_FUNCTIONS, 64);
	registerTable(registry, FLOAT_FUNCTIONS, 32);
}

function registerTable(registry, table, width) {
	for (const [name, operation] of Object.entries(table)) {
		registry.register(name, context => {
			const left = readNativeLibmFloat(context, 0, width);
			const right = readNativeLibmFloat(context, 1, width);
			return finishNativeLibmFloat(
				context,
				name,
				[left, right],
				operation(left, right),
				width
			);
		});
	}
}

function ieeeRemainder(left, right) {
	if (Number.isNaN(left) || Number.isNaN(right)
		|| !Number.isFinite(left) || right === 0) return Number.NaN;
	if (!Number.isFinite(right)) return left;
	const quotient = left / right;
	const nearest = nearestEvenInteger(quotient);
	const result = left - (nearest * right);
	if (result !== 0) return result;
	return Object.is(left, -0) || left < 0 ? -0 : 0;
}

function nearestEvenInteger(value) {
	const lower = Math.floor(value);
	const fraction = value - lower;
	if (fraction < 0.5) return lower;
	if (fraction > 0.5) return lower + 1;
	return lower % 2 === 0 ? lower : lower + 1;
}
