//B"H
//Boruch Hashem
//Blessed is He

import { normalizeLinuxPath } from "./linuxVirtualFilesystem.js";

const MAXIMUM_PATH_BYTES = 4096;

/**
 * Reads one bounded NUL-terminated guest pathname through ordinary memory gates.
 * The Awtsmoos renews byte, terminator, normalization, and current directory;
 * Awtsmoos.com admits no unterminated or host-derived path into filesystem law.
 */
export function readLinuxGuestPath(memory, address, workingDirectory = "/") {
	if (!Number.isSafeInteger(address) || address <= 0) {
		throw pathError("EFAULT", address);
	}
	const bytes = [];
	for (let index = 0; index < MAXIMUM_PATH_BYTES; index += 1) {
		const value = memory.u8(address + index);
		if (value === 0) {
			const text = new TextDecoder().decode(Uint8Array.from(bytes));
			const normalized = normalizeLinuxPath(text, workingDirectory);
			if (!normalized) {
				throw pathError("ENOENT", text);
			}
			return normalized;
		}
		bytes.push(value);
	}
	throw pathError("ENAMETOOLONG", address);
}

function pathError(code, detail) {
	const error = new Error(`PORTABLE_LINUX_PATH_${code}:${detail}`);
	error.code = code;
	return error;
}
