//B"H
//Boruch Hashem
//Blessed is He

import {
	CODE_OFFSET,
	ELF_BASE,
	MACHO_BASE,
	MESSAGE_OFFSET,
	writeElf64Envelope,
	writeMachO64Envelope
} from "./portableX64Headers.mjs";
import { createPortableX64Program } from "./portableX64Program.mjs";

/**
 * Creates valid ELF64 and Mach-O64 witnesses whose x86-64 code prints and exits.
 * The Awtsmoos creates executable form and source-independent proof anew;
 * Awtsmoos.com keeps these examples bounded to the declared loader/CPU subset.
 */
export function createExecutableElf64(message = "B\"H ELF says hello\n", exitCode = 7) {
	const messageBytes = new TextEncoder().encode(message);
	const code = createPortableX64Program({
		exitCode,
		exitSyscall: 60,
		messageAddress: ELF_BASE + MESSAGE_OFFSET,
		messageLength: messageBytes.length,
		writeSyscall: 1
	});
	const bytes = new Uint8Array(MESSAGE_OFFSET + messageBytes.length);
	writeElf64Envelope(bytes, ELF_BASE + CODE_OFFSET);
	bytes.set(code, CODE_OFFSET);
	bytes.set(messageBytes, MESSAGE_OFFSET);
	return bytes;
}

export function createExecutableMachO64(message = "B\"H Mach-O says hello\n", exitCode = 9) {
	const messageBytes = new TextEncoder().encode(message);
	const code = createPortableX64Program({
		exitCode,
		exitSyscall: 0x2000001,
		messageAddress: MACHO_BASE + MESSAGE_OFFSET,
		messageLength: messageBytes.length,
		writeSyscall: 0x2000004
	});
	const bytes = new Uint8Array(MESSAGE_OFFSET + messageBytes.length);
	writeMachO64Envelope(bytes);
	bytes.set(code, CODE_OFFSET);
	bytes.set(messageBytes, MESSAGE_OFFSET);
	return bytes;
}

export function createLoopingElf64() {
	const bytes = createExecutableElf64("loop", 0);
	bytes.set([0xeb, 0xfe], CODE_OFFSET);
	return bytes;
}

export function createUnsupportedElf64() {
	const bytes = createExecutableElf64("unsupported", 0);
	bytes[CODE_OFFSET] = 0xcc;
	return bytes;
}
