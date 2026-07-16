//B"H
//Boruch Hashem
//Blessed is He

import { PortableByteMemory } from "./byteMemory.js";
import { loadElf64Image } from "./elfImage.js";
import { loadMachO64Image } from "./machoImage.js";
import { PortableRegisterFile } from "./registerFile.js";
import { createPortableStack } from "./stackLayout.js";
import { createPortableSyscallHost } from "./syscallHost.js";
import { prepareVirtualDarwinRuntime } from "./virtualDarwinRuntime.js";
import { prepareVirtualProcessArguments } from "./virtualProcessArguments.js";
import { assertVirtualRuntimeSegments } from "./virtualRuntimeLayout.js";
import { executePortableX64 } from "./x64Executor.js";

const X64_ALIASES = new Set(["x86-64", "x86_64"]);

/**
 * Loads and executes x86-64 ELF or Mach-O bytes with bounded stack and imports.
 * The Awtsmoos creates image, C-main arguments, virtual dyld doorway, heap,
 * syscall, and result anew; Awtsmoos.com never confuses subset emulation with native.
 */
export function executePortableBinary(identity, bytes, host = {}, options = {}) {
	if (!X64_ALIASES.has(identity.architecture)) {
		throw portableBoundary(`PORTABLE_ARCHITECTURE:${identity.architecture}`);
	}
	const image = loadImage(identity.format, bytes, options);
	const virtualRuntime = identity.format === "mach-o"
		? prepareVirtualDarwinRuntime(bytes, image, options)
		: emptyVirtualRuntime();
	const processArguments = identity.format === "mach-o"
		? prepareVirtualProcessArguments(options)
		: emptyProcessArguments();
	const stack = createPortableStack(options);
	const segments = [
		...image.segments,
		...virtualRuntime.segments,
		...processArguments.segments,
		stack.segment
	];
	assertVirtualRuntimeSegments(segments);
	const memory = new PortableByteMemory(segments, options);
	const registers = new PortableRegisterFile(image.entryPoint, {
		memory,
		stackBase: stack.base,
		stackTop: stack.top
	});
	processArguments.apply(registers);
	const syscalls = createPortableSyscallHost(image.personality, host, {
		virtualImports: virtualRuntime.host
	});
	const execution = executePortableX64({
		limit: Number(options.instructionLimit || 100000),
		memory,
		registers,
		syscalls
	});
	return executionResult(
		image,
		stack,
		execution,
		virtualRuntime,
		processArguments
	);
}

function executionResult(
	image,
	stack,
	execution,
	virtualRuntime,
	processArguments
) {
	const syscallState = execution.syscalls;
	return Object.freeze({
		completeCpuEmulation: false,
		executionClass: "instruction-subset-emulation",
		exitCode: syscallState.exitCode ?? 0,
		format: image.format,
		imports: syscallState.imports,
		mode: "portable-x86-64-subset",
		personality: image.personality,
		processArguments: processArguments.metadata,
		registers: execution.registers,
		stack: Object.freeze({ base: stack.base, size: stack.size, top: stack.top }),
		stderr: syscallState.stderr,
		stdout: syscallState.stdout,
		steps: execution.steps,
		unsupportedBoundary: "Complete CPU, dyld/ld.so, frameworks, threads, signals, TLS, and unlisted instructions or calls remain unsupported.",
		virtualRuntime: virtualRuntime.metadata
	});
}

function loadImage(format, bytes, options) {
	if (format === "elf") return loadElf64Image(bytes, options);
	if (format === "mach-o") return loadMachO64Image(bytes, options);
	throw portableBoundary(`PORTABLE_FORMAT:${format}`);
}

function emptyVirtualRuntime() {
	return Object.freeze({ host: null, metadata: null, segments: Object.freeze([]) });
}

function emptyProcessArguments() {
	return Object.freeze({
		apply() {},
		metadata: null,
		segments: Object.freeze([])
	});
}

function portableBoundary(message) {
	const error = new Error(message);
	error.code = String(message).split(":")[0];
	return error;
}
