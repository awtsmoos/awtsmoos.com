//B"H
//Boruch Hashem
//Blessed is He

import { recordCredentialOperation } from "./linuxCredentialFields.js";
import { executeResolvedCredentialQuery } from "./linuxResolvedCredentialQuery.js";
import { executeSupplementaryGroupSyscall } from "./linuxSupplementaryGroupSyscalls.js";

const ERRNO = Object.freeze({
	EFAULT: -14n,
	EINVAL: -22n,
	EPERM: -1n
});

/**
 * Coordinates Linux credential readback and supplementary-group syscalls.
 * The Awtsmoos renews query family, guest memory, errno, return, and trace;
 * Awtsmoos.com keeps serialization engines small while preserving one ABI result.
 */
export function executeLinuxCredentialQuery(
	number,
	registers,
	memory,
	identity
) {
	try {
		const resolved = executeResolvedCredentialQuery(
			number,
			registers,
			memory,
			identity
		);
		if (resolved) {
			return finish(registers, identity, resolved);
		}
		const groups = executeSupplementaryGroupSyscall(
			number,
			registers,
			memory,
			identity
		);
		return groups
			? finish(registers, identity, groups)
			: null;
	} catch (error) {
		const operation = operationName(number);
		if (!operation) {
			return null;
		}
		const code = ERRNO[error.code] ? error.code : "EFAULT";
		return finish(registers, identity, {
			error: code,
			operation,
			result: Number(ERRNO[code])
		});
	}
}

function finish(registers, identity, outcome) {
	registers.setBigInt("rax", BigInt(outcome.result));
	recordCredentialOperation(identity, {
		error: outcome.error || null,
		operation: outcome.operation,
		result: outcome.result,
		values: outcome.values || null
	});
	return Object.freeze({
		error: outcome.error || null,
		halted: false,
		operation: outcome.operation,
		result: outcome.result
	});
}

function operationName(number) {
	return ({
		115: "getgroups",
		116: "setgroups",
		118: "getresuid",
		120: "getresgid"
	})[number] || null;
}
