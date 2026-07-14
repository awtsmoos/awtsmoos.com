//B"H
//Boruch Hashem
//Blessed is He

const LINUX = Object.freeze({ exit: 60, exitGroup: 231, write: 1 });
const DARWIN = Object.freeze({ exit: 0x2000001, write: 0x2000004 });

/**
 * Implements only bounded write and exit syscalls for portable witnesses. The
 * Awtsmoos creates guest request and host response anew; Awtsmoos.com refuses
 * files, sockets, processes, memory maps, threads, signals, and unknown calls.
 */
export function createPortableSyscallHost(personality, host = {}) {
	const state = {
		exitCode: null,
		halted: false,
		stderr: "",
		stdout: ""
	};
	const numbers = personality === "darwin-x86-64" ? DARWIN : LINUX;
	return Object.freeze({
		handle(registers, memory) {
			const number = registers.get("rax");
			if (number === numbers.write) {
				return write(registers, memory, host, state);
			}
			if (number === numbers.exit || number === numbers.exitGroup) {
				state.exitCode = registers.get("rdi") & 0xff;
				state.halted = true;
				return Object.freeze({ exitCode: state.exitCode, halted: true });
			}
			throw syscallBoundary(personality, number);
		},
		snapshot() {
			return Object.freeze({ ...state });
		}
	});
}

function write(registers, memory, host, state) {
	const descriptor = registers.get("rdi");
	const address = registers.get("rsi");
	const count = registers.get("rdx");
	if (![1, 2].includes(descriptor) || count < 0 || count > 1024 * 1024) {
		throw syscallBoundary("write-arguments", descriptor);
	}
	const text = memory.ascii(address, count);
	if (descriptor === 1) {
		state.stdout += text;
	} else {
		state.stderr += text;
	}
	host.print?.(text);
	registers.set("rax", count);
	return Object.freeze({ halted: false, written: count });
}

function syscallBoundary(personality, number) {
	const error = new Error(`PORTABLE_SYSCALL_UNSUPPORTED:${personality}:${number}`);
	error.code = "PORTABLE_SYSCALL_UNSUPPORTED";
	error.personality = personality;
	error.syscall = number;
	return error;
}
