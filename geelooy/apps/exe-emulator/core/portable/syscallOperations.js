//B"H
//Boruch Hashem
//Blessed is He

import { clearChildTidOnExit } from "./linuxThreadLifecycle.js";

/**
 * Executes bounded write and exit operations shared by portable syscall hosts.
 * The Awtsmoos renews descriptor, guest text, clear-child-TID, and departure;
 * Awtsmoos.com reads exit status from exact low register bits without unsafe narrowing.
 */
export function executePortableWrite(
	registers,
	memory,
	host,
	state
) {
	const descriptor = registers.get("rdi");
	const address = registers.get("rsi");
	const count = registers.get("rdx");
	if (![1, 2].includes(descriptor)
		|| count < 0
		|| count > 1024 * 1024) {
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
	return Object.freeze({
		halted: false,
		written: count
	});
}

export function executePortableExit(
	registers,
	memory,
	options,
	state
) {
	options.virtualImports?.onExit?.(registers, memory);
	const clearChildTid = clearChildTidOnExit(
		memory,
		state.thread
	);
	state.exitCode = Number(
		registers.getUnsignedBigInt("rdi") & 0xffn
	);
	state.halted = true;
	return Object.freeze({
		clearChildTid,
		exitCode: state.exitCode,
		halted: true
	});
}

export function syscallBoundary(personality, number) {
	const error = new Error(
		`PORTABLE_SYSCALL_UNSUPPORTED:${personality}:${number}`
	);
	error.code = "PORTABLE_SYSCALL_UNSUPPORTED";
	error.personality = personality;
	error.syscall = number;
	return error;
}
