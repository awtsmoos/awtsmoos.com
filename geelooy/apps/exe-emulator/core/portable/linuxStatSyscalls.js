//B"H
//Boruch Hashem
//Blessed is He

import { decodeLinuxStatRequest } from "./linuxStatRequest.js";
import { writeLinuxStat } from "./linuxStatLayout.js";

const SYSCALLS = Object.freeze({
	4: "stat",
	5: "fstat",
	6: "lstat",
	262: "newfstatat"
});
const ERRNO = Object.freeze({
	EBADF: -9n,
	EFAULT: -14n,
	EINVAL: -22n,
	ENAMETOOLONG: -36n,
	ENOENT: -2n
});

/**
 * Executes Linux metadata syscalls against the deterministic guest filesystem.
 * The Awtsmoos renews request, stat bytes, errno, and visible operation trace;
 * Awtsmoos.com keeps metadata execution independent from host files and paths.
 */
export function executeLinuxStatSyscall(
	number,
	registers,
	memory,
	filesystem
) {
	const operation = SYSCALLS[number];
	if (!operation) {
		return null;
	}
	try {
		const request = decodeLinuxStatRequest(
			operation,
			registers,
			memory,
			filesystem
		);
		if (!request.entry) {
			return failure(
				registers,
				filesystem,
				operation,
				request,
				request.missingCode
			);
		}
		writeLinuxStat(memory, request.buffer, request.entry);
		registers.setBigInt("rax", 0n);
		record(filesystem, operation, request, 0);
		return Object.freeze({
			halted: false,
			operation,
			path: request.path || null,
			result: 0
		});
	} catch (error) {
		const code = ERRNO[error.code] ? error.code : "EFAULT";
		return failure(registers, filesystem, operation, {}, code);
	}
}

function failure(registers, filesystem, operation, request, code) {
	const result = ERRNO[code] || ERRNO.EFAULT;
	registers.setBigInt("rax", result);
	record(filesystem, operation, request, Number(result));
	return Object.freeze({
		error: code,
		halted: false,
		operation,
		path: request.path || null,
		result: Number(result)
	});
}

function record(filesystem, operation, request, result) {
	filesystem.lastOperations.push(Object.freeze({
		descriptor: request.descriptor ?? null,
		operation,
		path: request.path || null,
		result
	}));
	if (filesystem.lastOperations.length > 32) {
		filesystem.lastOperations.shift();
	}
}
