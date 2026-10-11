//B"H
//Boruch Hashem
//Blessed is He

import {
	decodeCStringEscapes,
	stringDataLines
} from "./types.js";
import { accessOf } from "./aggregates.js";
import { alignUp } from "../../../../../shared/compiling/native/image/align.js";
import { portableCError } from "./errors.js";

/**
 * Emits deterministic global storage through assembly data symbols. Every
 * global occupies its AAPCS64 byte size padded up to 8 bytes, so all globals
 * stay 8-aligned; aggregates are byte-packed with the shared layout engine
 * and string literals are NUL-terminated byte runs. The Awtsmoos creates
 * static value, address, and relocation anew; Awtsmoos.com reuses the verified
 * object linker instead of embedding format-specific addresses.
 */
export function emitPortableCGlobals(irModule, layout, strings) {
	const names = new Set(irModule.globals.map(global => global.name));
	const globalTypes = new Map(irModule.globals.map(global => [global.name, global.valueType]));
	const metadata = [];
	const lines = [];
	for (const global of irModule.globals) {
		const kind = global.valueType?.kind;
		if (kind === "array" || kind === "structure") {
			const size = alignUp(layout.typeSize(global.valueType), 8);
			lines.push(...aggregateGlobalLines(global, size));
			metadata.push(Object.freeze({
				bytes: size,
				kind: "aggregate",
				name: global.name,
				valueType: global.valueType
			}));
			continue;
		}
		assertScalarType(global.valueType, global.name);
		const access = accessOf(global.valueType, { layout });
		const description = initializerDescription(global.initializer, names, strings, access);
		lines.push(...scalarGlobalLines(global.name, description, access.bytes));
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

/** One 8-byte data line per 8 bytes of global storage, zero-padded. */
function dataLinesFor(label, bytes) {
	const lines = [];
	const total = alignUp(bytes.length, 8);
	while (bytes.length < total) bytes.push(0);
	for (let offset = 0; offset < total; offset += 8) {
		const chunk = bytes.slice(offset, offset + 8);
		lines.push(`${offset === 0 ? label : `${label}_c${offset / 8}`}: ${chunk.join(", ")}`);
	}
	return lines;
}

function aggregateGlobalLines(global, size) {
	const initializer = global.initializer;
	if (!initializer) {
		return dataLinesFor(global.name, new Array(size).fill(0));
	}
	if (initializer.kind === "string") {
		return stringArrayGlobalLines(global, size);
	}
	throw unsupportedInitializer(initializer);
}

function stringArrayGlobalLines(global, size) {
	const text = decodeCStringEscapes(String(global.initializer.value ?? global.initializer.raw ?? ""));
	const bytes = [...text].map(ch => ch.charCodeAt(0) & 0xff);
	bytes.push(0);
	if (bytes.length > size) {
		throw portableCError(
			"PORTABLE_C_GLOBAL_INITIALIZER_UNSUPPORTED",
			`String initializer overflows global '${global.name}' (${bytes.length} bytes into ${size} bytes)`
		);
	}
	while (bytes.length < size) bytes.push(0);
	return dataLinesFor(global.name, bytes);
}

function scalarGlobalLines(name, description, bytes) {
	if (description.kind === "global-address") {
		return [`${name}: ${description.assembly}`];
	}
	const raw = byteList(description, bytes);
	return dataLinesFor(name, raw);
}

function byteList(description, bytes) {
	if (description.kind === "zero") {
		return new Array(bytes).fill(0);
	}
	if (description.kind === "integer") {
		const out = [];
		let remaining = BigInt(description.value);
		for (let index = 0; index < bytes; index += 1) {
			out.push(Number(remaining & 0xffn));
			remaining >>= 8n;
		}
		return out;
	}
	if (description.kind === "floatBits") {
		const out = [];
		let remaining = description.bits;
		for (let index = 0; index < bytes; index += 1) {
			out.push(Number(remaining & 0xffn));
			remaining >>= 8n;
		}
		return out;
	}
	throw unsupportedInitializer(description);
}

function initializerDescription(initializer, globalNames, strings, access) {
	if (!initializer) {
		return Object.freeze({ assembly: zeroBytes(), kind: "zero" });
	}
	if (initializer.kind === "integer") {
		return integerInitializer(initializer.raw);
	}
	if (initializer.kind === "floatLiteral") {
		return floatInitializer(initializer.raw, initializer.valueType);
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
		return integerInitializer(`-${initializer.operand.raw}`);
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

function integerInitializer(raw) {
	let value;
	try {
		value = BigInt(String(raw).trim());
	} catch {
		throw portableCError(
			"PORTABLE_C_GLOBAL_INTEGER_RANGE",
			`Global integer '${raw}' is not a valid integer`
		);
	}
	if (value < -(1n << 63n) || value > (1n << 64n) - 1n) {
		throw portableCError(
			"PORTABLE_C_GLOBAL_INTEGER_RANGE",
			`Global integer '${raw}' is outside 64-bit range`
		);
	}
	return Object.freeze({ kind: "integer", value });
}

function floatInitializer(raw, valueType) {
	const text = String(raw).trim();
	const isFloat = valueType?.kind === "float"
		? Number(valueType.bits) !== 64
		: /[fF]$/.test(text);
	const numeric = Number(isFloat ? text.replace(/[fF]$/, "") : text);
	if (!Number.isFinite(numeric)) {
		throw portableCError(
			"PORTABLE_C_GLOBAL_INITIALIZER_UNSUPPORTED",
			`Global float initializer '${raw}' is not finite`
		);
	}
	const buffer = new ArrayBuffer(8);
	const view = new DataView(buffer);
	let bits;
	if (isFloat) {
		view.setFloat32(0, numeric, true);
		bits = BigInt(view.getUint32(0, true));
	} else {
		view.setFloat64(0, numeric, true);
		bits = view.getBigUint64(0, true);
	}
	return Object.freeze({ bits, kind: "floatBits" });
}

function zeroBytes() {
	return "0, 0, 0, 0, 0, 0, 0, 0";
}

function assertScalarType(valueType, name) {
	if (!["integer", "pointer", "float"].includes(valueType?.kind)) {
		throw portableCError(
			"PORTABLE_C_GLOBAL_TYPE_UNSUPPORTED",
			`Global '${name}' must be integer, float, or pointer storage`
		);
	}
}

function unsupportedInitializer(initializer) {
	return portableCError(
		"PORTABLE_C_GLOBAL_INITIALIZER_UNSUPPORTED",
		`Unsupported constant global initializer '${initializer?.kind}'`
	);
}
