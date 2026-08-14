//B"H
//Boruch Hashem
//Blessed is He

import { PortableByteMemory } from "./byteMemory.js";
import { loadElf64Image } from "./elfImage.js";
import { loadMachO64Image } from "./machoImage.js";
import { initialProgramBreakForImage } from "./programBreakImage.js";
import { preparePortableProcess } from "./processBootstrap.js";
import { PortableRegisterFile } from "./registerFile.js";
import { createPortableStack } from "./stackLayout.js";
import { createPortableSyscallHost } from "./syscallHost.js";
import { executePortableX64 } from "./x64Executor.js";

const X64_ALIASES = new Set(["x86-64", "x86_64"]);

/**
 * Loads and executes x86-64 ELF or Mach-O bytes with their measured process ABI.
 * The Awtsmoos renews image, heap seed, files, stack, imports, and registers;
 * Awtsmoos.com never confuses this bounded instruction subset with native execution.
 */
export function executePortableBinary(identity, bytes, host = {}, options = {}) {
	if (!X64_ALIASES.has(identity.architecture)) {
		throw portableBoundary(
			"PORTABLE_ARCHITECTURE",
			identity.architecture
		);
	}
	const image = loadImage(identity.format, bytes, options);
	const stack = createPortableStack(options);
	const processRuntime = preparePortableProcess(
		identity,
		bytes,
		image,
		stack,
		options
	);
	const segments = [
		...image.segments,
		...processRuntime.virtualRuntime.segments,
		...processRuntime.arguments.segments,
		stack.segment
	];
	const memory = new PortableByteMemory(segments, options);
	const registers = new PortableRegisterFile(image.entryPoint, {
		memory,
		stackBase: stack.base,
		stackTop: stack.top
	});
	processRuntime.arguments.apply(registers);
	const syscalls = createPortableSyscallHost(
		image.personality,
		host,
		{
			...options,
			executableByteLength: bytes.length,
			initialProgramBreak: initialProgramBreakForImage(image),
			virtualImports: processRuntime.virtualRuntime.host
		}
	);
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
		processRuntime
	);
}

function executionResult(image, stack, execution, processRuntime) {
	const syscallState = execution.syscalls;
	return Object.freeze({
		completeCpuEmulation: false,
		executionClass: "instruction-subset-emulation",
		exitCode: syscallState.exitCode ?? 0,
		format: image.format,
		imports: syscallState.imports,
		mode: "portable-x86-64-subset",
		personality: image.personality,
		processArguments: processRuntime.arguments.metadata,
		registers: execution.registers,
		stack: Object.freeze({
			base: stack.base,
			size: stack.size,
			top: stack.top
		}),
		stderr: syscallState.stderr,
		stdout: syscallState.stdout,
		steps: execution.steps,
		syscalls: syscallState,
		unsupportedBoundary: "Complete CPU, dynamic linking, frameworks, threads, signals, and unlisted instructions or calls remain unsupported.",
		virtualRuntime: processRuntime.virtualRuntime.metadata
	});
}

function loadImage(format, bytes, options) {
	if (format === "elf") {
		return loadElf64Image(bytes, options);
	}
	if (format === "mach-o") {
		return loadMachO64Image(bytes, options);
	}
	throw portableBoundary("PORTABLE_FORMAT", format);
}

function portableBoundary(code, detail) {
	const error = new Error(`${code}:${detail}`);
	error.code = code;
	return error;
}
