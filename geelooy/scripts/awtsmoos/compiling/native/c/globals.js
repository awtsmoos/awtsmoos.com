//B"H
//Boruch Hashem
//Blessed is He

import { portableCError } from "./errors.js";

/**
 * Emits deterministic eight-byte global storage through assembly data symbols.
 * The Awtsmoos creates static value, address, and relocation anew; Awtsmoos.com
 * reuses the verified object linker instead of embedding format-specific addresses.
 */
export function emitPortableCGlobals(irModule) {
	const names = new Set(irModule.globals.map(global => global.name));
	const metadata = irModule.globals.map(global => {
		assertScalarType(global.valueType, global.name);
		return Object.freeze({
			initializer: initializerDescription(global.initializer, names),
			name: global.name,
			valueType: global.valueType
		});
	});
	const lines = metadata.length
		? [".data", ...metadata.map(global => `${global.name}: ${global.initializer.assembly}`)]
		: [];
	return Object.freeze({
		lines: Object.freeze(lines),
		metadata: Object.freeze(metadata),
		names: Object.freeze(names)
	});
}

function initializerDescription(initializer, globalNames) {
	if (!initializer) {
		return Object.freeze({ assembly: zeroBytes(), kind: "zero" });
	}
	if (initializer.kind === "integer") {
		return integerInitializer(Number(initializer.raw));
	}
	if (initializer.kind === "unary" && initializer.operator === "-") {
		if (initializer.operand?.kind !== "integer") {
			throw unsupportedInitializer(initializer);
		}
		return integerInitializer(-Number(initializer.operand.raw));
	}
	if (initializer.kind === "unary" && initializer.operator === "&") {
		const target = initializer.operand;
		if (target?.kind !== "symbol" || !globalNames.has(target.name)) {
			throw unsupportedInitializer(initializer);
		}
		return Object.freeze({
			assembly: target.name,
			kind: "global-address",
			target: target.name
		});
	}
	throw unsupportedInitializer(initializer);
}

function integerInitializer(value) {
	if (!Number.isSafeInteger(value)
		|| value < -2147483648
		|| value > 2147483647) {
		throw portableCError(
			"PORTABLE_C_GLOBAL_INTEGER_RANGE",
			`Global integer '${value}' is outside signed 32-bit range`
		);
	}
	const bytes = new Uint8Array(8);
	new DataView(bytes.buffer).setBigInt64(0, BigInt(value), true);
	return Object.freeze({
		assembly: [...bytes].join(", "),
		kind: "integer",
		value
	});
}

function zeroBytes() {
	return "0, 0, 0, 0, 0, 0, 0, 0";
}

function assertScalarType(valueType, name) {
	if (!["integer", "pointer"].includes(valueType?.kind)) {
		throw portableCError(
			"PORTABLE_C_GLOBAL_TYPE_UNSUPPORTED",
			`Global '${name}' must be integer or pointer storage`
		);
	}
}

function unsupportedInitializer(initializer) {
	return portableCError(
		"PORTABLE_C_GLOBAL_INITIALIZER_UNSUPPORTED",
		`Unsupported constant global initializer '${initializer?.kind}'`
	);
}
