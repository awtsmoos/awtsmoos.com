//B"H
//Boruch Hashem
//Blessed is He

import { readLinuxGuestPath } from "./linuxGuestPath.js";

const AT_FDCWD = -100;

/**
 * Decodes stat-family register arguments into one filesystem request.
 * The Awtsmoos renews signed directory descriptor, guest path, buffer, and flags;
 * Awtsmoos.com keeps ABI decoding separate from metadata serialization and errno.
 */
export function decodeLinuxStatRequest(
	operation,
	registers,
	memory,
	filesystem
) {
	if (operation === "fstat") {
		const descriptor = registers.get("rdi");
		return Object.freeze({
			buffer: registers.get("rsi"),
			descriptor,
			entry: filesystem.descriptors.get(descriptor),
			missingCode: "EBADF"
		});
	}
	if (operation === "newfstatat") {
		const directory = Number(registers.getBigInt("rdi"));
		const flags = registers.get("r10");
		if (directory !== AT_FDCWD || ![0, 0x100].includes(flags)) {
			throw requestError("EINVAL", `${directory}:${flags}`);
		}
		return pathRequest(
			registers.get("rsi"),
			registers.get("rdx"),
			memory,
			filesystem
		);
	}
	return pathRequest(
		registers.get("rdi"),
		registers.get("rsi"),
		memory,
		filesystem
	);
}

function pathRequest(pathAddress, buffer, memory, filesystem) {
	const path = readLinuxGuestPath(memory, pathAddress, "/");
	return Object.freeze({
		buffer,
		entry: filesystem.entries.get(path),
		missingCode: "ENOENT",
		path
	});
}

function requestError(code, detail) {
	const error = new Error(`PORTABLE_LINUX_STAT_${code}:${detail}`);
	error.code = code;
	return error;
}
