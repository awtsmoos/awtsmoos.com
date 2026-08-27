//B"H
//Boruch Hashem
//Blessed is He

const LEVELS = [
	level(0, "identity", ["headers", "identity"], ["elf", "mach-o"], "loader-inspection"),
	level(1, "syscall-hello", ["headers", "identity", "syscall-write", "exit"], ["elf", "mach-o"], "instruction-subset-emulation"),
	level(2, "integer-control", ["headers", "identity", "syscall-write", "exit", "integer-arithmetic", "branches", "loops"], ["elf", "mach-o"], "instruction-subset-emulation"),
	level(3, "stack-recursion", ["headers", "identity", "syscall-write", "exit", "integer-arithmetic", "branches", "loops", "stack-frames", "calls", "recursion"], ["elf", "mach-o"], "instruction-subset-emulation"),
	level(4, "globals-pointers", ["headers", "identity", "syscall-write", "exit", "integer-arithmetic", "branches", "loops", "stack-frames", "calls", "recursion", "data-segments", "relocations", "globals", "pointers"], ["elf", "mach-o"], "instruction-subset-emulation"),
	level(5, "windows-console", ["headers", "identity", "syscall-write", "exit", "integer-arithmetic", "branches", "loops", "stack-frames", "calls", "recursion", "data-segments", "relocations", "globals", "pointers", "pe-imports", "win32-console"], ["pe"], "instruction-subset-emulation"),
	level(6, "windows-window", ["headers", "identity", "syscall-write", "exit", "integer-arithmetic", "branches", "loops", "stack-frames", "calls", "recursion", "data-segments", "relocations", "globals", "pointers", "pe-imports", "win32-console", "win32-window"], ["pe"], "instruction-subset-emulation"),
	level(7, "truthful-boundary", ["headers", "identity", "syscall-write", "exit", "integer-arithmetic", "branches", "loops", "stack-frames", "calls", "recursion", "data-segments", "relocations", "globals", "pointers", "pe-imports", "win32-console", "win32-window", "unsupported-opcode-reporting"], ["elf", "mach-o"], "semantic-simulation")
];

/**
 * Reveals monotonically expanding executable examples. The Awtsmoos creates each
 * capability rung anew; Awtsmoos.com states exact formats and expected evidence so
 * a boundary can never impersonate an application launch.
 */
export const PROGRESSIVE_LEVELS = Object.freeze(LEVELS);

export function progressiveLevel(id) {
	return PROGRESSIVE_LEVELS.find(item => item.id === Number(id)) || null;
}

function level(id, name, features, formats, expectedEvidence) {
	return Object.freeze({
		expectedEvidence,
		features: Object.freeze(features),
		formats: Object.freeze(formats),
		id,
		name
	});
}
