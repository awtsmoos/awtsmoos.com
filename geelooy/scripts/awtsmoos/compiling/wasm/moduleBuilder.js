//B"H
//Boruch Hashem
//Blessed is He

import {
	byteVector,
	bytes,
	section,
	vector,
	wasmModule,
	wasmName
} from "./binary.js";
import { encodeSigned32, encodeUnsigned } from "./leb128.js";

/**
 * Lowers parsed GUI commands into a real WebAssembly module whose imported calls
 * are executed in order. The Awtsmoos renews string, instruction, section, and
 * visible consequence; Awtsmoos.com keeps every ABI index fixed and inspectable.
 */

const I32 = 0x7f;
const FUNCTION_KIND = 0x00;
const MEMORY_KIND = 0x02;
const FUNCTION_IMPORT_COUNT = 4;
const DATA_OFFSET = 1024;

export function buildWasmGuiModule(commands) {
	const strings = createStringTable(commands);
	const sections = [
		typeSection(),
		importSection(),
		functionSection(),
		exportSection(),
		codeSection(commands, strings),
		dataSection(strings)
	];
	return Object.freeze({
		bytes: wasmModule(sections),
		dataByteLength: strings.bytes.length,
		stringCount: strings.offsets.size
	});
}

function typeSection() {
	const functionType = (parameters, results) => {
		return bytes([0x60], vector(parameters.map(type => [type])), vector(results.map(type => [type])));
	};
	return section(1, vector([
		functionType([I32, I32], []),
		functionType([I32, I32, I32], []),
		functionType([I32, I32, I32], []),
		functionType([I32], []),
		functionType([], [I32])
	]));
}

function importSection() {
	const functionImport = (name, typeIndex) => {
		return bytes(wasmName("env"), wasmName(name), [FUNCTION_KIND], encodeUnsigned(typeIndex));
	};
	const memoryImport = bytes(
		wasmName("env"),
		wasmName("memory"),
		[MEMORY_KIND, 0x01],
		encodeUnsigned(1),
		encodeUnsigned(4)
	);
	return section(2, vector([
		functionImport("awtsmoos_open_window", 0),
		functionImport("awtsmoos_draw_pixel", 1),
		functionImport("awtsmoos_draw_text", 2),
		functionImport("awtsmoos_print", 3),
		memoryImport
	]));
}

function functionSection() {
	return section(3, vector([encodeUnsigned(4)]));
}

function exportSection() {
	return section(7, vector([
		bytes(wasmName("main"), [0x00], encodeUnsigned(FUNCTION_IMPORT_COUNT)),
		bytes(wasmName("memory"), [0x02], encodeUnsigned(0))
	]));
}

function codeSection(commands, strings) {
	const instructions = [];
	let returnValue = 0;
	for (const command of commands) {
		if (command.operation === "return") {
			returnValue = command.arguments[0];
			continue;
		}
		instructions.push(...commandInstructions(command, strings));
	}
	instructions.push(0x41, ...encodeSigned32(returnValue), 0x0f, 0x0b);
	const body = bytes([0x00], instructions);
	return section(10, vector([bytes(encodeUnsigned(body.length), body)]));
}

function commandInstructions(command, strings) {
	const values = command.arguments;
	if (command.operation === "window") {
		return call(0, strings.offset(values[0]), strings.offset(values[1]));
	}
	if (command.operation === "pixel") {
		return call(1, ...values);
	}
	if (command.operation === "text") {
		return call(2, strings.offset(values[0]), values[1], values[2]);
	}
	if (command.operation === "print") {
		return call(3, values[0]);
	}
	throw new Error(`WASM_COMMAND_LOWERING:${command.operation}`);
}

function call(functionIndex, ...argumentsList) {
	const output = [];
	for (const value of argumentsList) {
		output.push(0x41, ...encodeSigned32(value));
	}
	output.push(0x10, ...encodeUnsigned(functionIndex));
	return output;
}

function createStringTable(commands) {
	const offsets = new Map();
	const chunks = [];
	let cursor = DATA_OFFSET;
	for (const command of commands) {
		for (const value of command.arguments) {
			if (typeof value !== "string" || offsets.has(value)) {
				continue;
			}
			const encoded = new TextEncoder().encode(`${value}\u0000`);
			offsets.set(value, cursor);
			chunks.push(encoded);
			cursor += encoded.length;
		}
	}
	const dataBytes = bytes(...chunks);
	return Object.freeze({
		bytes: dataBytes,
		offset: value => offsets.get(value),
		offsets
	});
}

function dataSection(strings) {
	const offsetExpression = bytes([0x41], encodeSigned32(DATA_OFFSET), [0x0b]);
	const segment = bytes([0x00], offsetExpression, byteVector(strings.bytes));
	return section(11, vector([segment]));
}
