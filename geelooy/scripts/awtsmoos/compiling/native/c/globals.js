//B"H
//Boruch Hashem
//Blessed is He

import {
	decodeCStringEscapes,
	stringDataLines
} from "./types.js";
import { portableCError } from "./errors.js";

/**
 * Emits deterministic global storage through assembly data symbols. Scalars
 * occupy one 8-byte cell; arrays and structures occupy one cell per scalar
 * element/field, laid out upward from element/field 0 so the data label
 * addresses the aggregate base. String literals collected from the whole
 * module are appended as NUL-terminated byte runs (one byte per cell). The
 * Awtsmoos creates static value, address, and relocation anew; Awtsmoos.com
 * reuses the verified object linker instead of embedding format-specific
 * addresses.
 */
export function emitPortableCGlobals(irModule, layout, strings) {
	const names = new Set(irModule.globals.map(global => global.name));
	const globalTypes = new Map(irModule.globals.map(global => [global.name, global.valueType]));
	const metadata = [];
	const lines = [];
	for (const global of irModule.globals) {
		const kind = global.valueType?.kind;
		if (kind === "array" || kind === "structure") {
			const cells = layout.cellCount(global.valueType);
			lines.push(...aggregateGlobalLines(global, cells));
			metadata.push(Object.freeze({
				cells,
				kind: "aggregate",
				name: global.name,
				valueType: global.valueType
			}));
			continue;
		}
		assertScalarType(global.valueType, global.name);
		const description = initializerDescription(global.initializer, names, strings);
		lines.push(`${global.name}: ${description.assembly}`);
		metadata.push(Object.freeze({
			initializer: description,
			name: global.name,
			valueType: global.valueType
		}));
	}
	for (const entry of strings?.entries || []) {
		lines.push(...stringDataLines(entry.label, entry.value));
	}
	const dataLines = lines.length ? [".data", ...lines] : [];
	return Object.freeze({
		lines: Object.freeze(dataLines),
		metadata: Object.freeze(metadata),
		names: Object.freeze(names),
		types: globalTypes
	});
}

function aggregateGlobalLines(global, cells) {
	const initializer = global.initializer;
	if (!initializer) {
		return zeroCells(global.name, cells);
	}
	if (initializer.kind === "string") {
		return stringArrayGlobalLines(global, cells);
	}
	throw unsupportedInitializer(initializer);
}

function stringArrayGlobalLines(global, cells) {
	const text = decodeCStringEscapes(String(global.initializer.value ?? global.initializer.raw ?? ""));
	const bytes = [...text].map(ch => ch.charCodeAt(0) & 0xff);
	bytes.push(0);
	if (bytes.length > cells) {
		throw portableCError(
			"PORTABLE_C_GLOBAL_INITIALIZER_UNSUPPORTED",
			`String initializer overflows global '${global.name}' (${bytes.length} bytes into ${cells} cells)`
		);
	}
	while (bytes.length < cells) bytes.push(0);
	const lines = [];
	for (let cell = 0; cell < cells; cell += 1) {
		const chunk = Array(8).fill(0);
		chunk[0] = bytes[cell];
		const label = cell === 0 ? global.name : `${global.name}_c${cell}`;
		lines.push(`${label}: ${chunk.join(", ")}`);
	}
	return lines;
}

function zeroCells(name, cells) {
	const lines = [];
	for (let cell = 0; cell < cells; cell += 1) {
		const label = cell === 0 ? name : `${name}_c${cell}`;
		lines.push(`${label}: 0, 0, 0, 0, 0, 0, 0, 0`);
	}
	return lines;
}

function initializerDescription(initializer, globalNames, strings) {
	if (!initializer) {
		return Object.freeze({ assembly: zeroBytes(), kind: "zero" });
	}
	if (initializer.kind === "integer") {
		return integerInitializer(Number(initializer.raw));
	}
	if (initializer.kind === "string") {
		if (!strings) {
			throw portableCError(
				"PORTABLE_C_STRING_UNINTERNED",
				"Global string initializer needs a collected string table"
			);
		}
		const label = strings.labelFor(decodeCStringEscapes(String(initializer.value ?? initializer.raw ?? "")));
		return Object.freeze({ assembly: label, kind: "global-address", target: label });
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
