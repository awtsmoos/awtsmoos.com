//B"H
//Boruch Hashem
//Blessed is He

import {
	deterministicLinuxRandom,
	linuxArguments,
	linuxAuxiliaryVector,
	linuxEnvironment
} from "./linuxStartupValues.js";

/**
 * Writes the System V process-entry stack consumed by an ELF `_start`. The
 * Awtsmoos renews argc, argv, envp, auxv, strings, and initial RSP together;
 * Awtsmoos.com leaves no first instruction pointing at an exclusive unmapped top.
 */

const encoder = new TextEncoder();
const WORD_BYTES = 8;

export function prepareLinuxProcessStack(stack, image, options = {}) {
	const argumentsList = linuxArguments(options);
	const environment = linuxEnvironment(options);
	const state = createWriter(stack);
	const argumentPointers = argumentsList.map(value => {
		return writeString(state, value);
	});
	const environmentPointers = environment.map(value => {
		return writeString(state, value);
	});
	const platformPointer = writeString(state, "x86_64");
	const executablePointer = writeString(
		state,
		argumentsList[0] || "portable-executable"
	);
	const randomPointer = writeBytes(
		state,
		deterministicLinuxRandom()
	);
	state.cursor = alignDown(state.cursor, 16);
	const auxiliary = linuxAuxiliaryVector(image, {
		executable: executablePointer,
		platform: platformPointer,
		random: randomPointer
	});
	const words = startupWords(
		argumentsList.length,
		argumentPointers,
		environmentPointers,
		auxiliary
	);
	const stackOffset = alignDown(
		state.cursor - words.length * WORD_BYTES,
		16
	);
	assertCapacity(stackOffset, words.length * WORD_BYTES);
	writeWords(state.bytes, stackOffset, words);
	const stackPointer = stack.base + stackOffset;
	return Object.freeze({
		apply(registers) {
			registers.set("rsp", stackPointer);
			registers.set("rbp", 0);
			registers.set("rdx", 0);
		},
		metadata: Object.freeze({
			argc: argumentsList.length,
			arguments: argumentsList,
			auxiliaryCount: auxiliary.length,
			environment,
			stackPointer
		}),
		segments: Object.freeze([])
	});
}

function startupWords(argc, argv, envp, auxiliary) {
	return [
		argc,
		...argv,
		0,
		...envp,
		0,
		...auxiliary.flatMap(entry => [entry.type, entry.value])
	];
}

function createWriter(stack) {
	return {
		base: stack.base,
		bytes: stack.segment.bytes,
		cursor: stack.size
	};
}

function writeString(state, value) {
	return writeBytes(state, encoder.encode(`${value}\u0000`));
}

function writeBytes(state, value) {
	state.cursor -= value.length;
	assertCapacity(state.cursor, value.length);
	state.bytes.set(value, state.cursor);
	return state.base + state.cursor;
}

function writeWords(bytes, offset, values) {
	const view = new DataView(
		bytes.buffer,
		bytes.byteOffset,
		bytes.byteLength
	);
	values.forEach((value, index) => {
		view.setBigUint64(
			offset + index * WORD_BYTES,
			BigInt(value),
			true
		);
	});
}

function assertCapacity(offset, length) {
	if (!Number.isSafeInteger(offset)
		|| offset < 0
		|| !Number.isSafeInteger(length)
		|| length < 0) {
		const error = new Error(
			`PORTABLE_LINUX_STACK_CAPACITY:${offset}:${length}`
		);
		error.code = "PORTABLE_LINUX_STACK_CAPACITY";
		throw error;
	}
}

function alignDown(value, alignment) {
	return Math.floor(value / alignment) * alignment;
}
