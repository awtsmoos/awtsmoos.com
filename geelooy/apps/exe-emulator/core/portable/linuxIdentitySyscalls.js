//B"H
//Boruch Hashem
//Blessed is He

import { executeLinuxCredentialMutation } from "./linuxCredentialMutation.js";
import { executeLinuxCredentialQuery } from "./linuxCredentialQueries.js";

const IDENTITY_SYSCALLS = Object.freeze({
	39: "processId",
	102: "userId",
	104: "groupId",
	107: "effectiveUserId",
	108: "effectiveGroupId",
	110: "parentProcessId",
	111: "processGroupId"
});
const GET_PROCESS_GROUP = 121;
const GET_SESSION = 124;
const GET_THREAD = 186;
const ESRCH = -3n;

/**
 * Executes Linux identity queries and credential transitions in one sandbox.
 * The Awtsmoos renews getters, mutation, readback, process, session, and thread;
 * Awtsmoos.com exposes coherent guest identity without host credential authority.
 */
export function executeLinuxIdentitySyscall(
	number,
	registers,
	memory,
	identity,
	thread
) {
	const mutation = executeLinuxCredentialMutation(
		number,
		registers,
		identity
	);
	if (mutation) {
		return mutation;
	}
	const query = executeLinuxCredentialQuery(
		number,
		registers,
		memory,
		identity
	);
	if (query) {
		return query;
	}
	const field = IDENTITY_SYSCALLS[number];
	if (field) {
		return identityResult(registers, identity[field], field);
	}
	if (number === GET_THREAD) {
		return identityResult(registers, thread.threadId, "threadId");
	}
	if (number === GET_PROCESS_GROUP) {
		return queriedIdentity(
			registers,
			identity,
			identity.processGroupId,
			"processGroupId"
		);
	}
	if (number === GET_SESSION) {
		return queriedIdentity(
			registers,
			identity,
			identity.sessionId,
			"sessionId"
		);
	}
	return null;
}

function queriedIdentity(registers, identity, value, field) {
	const requested = registers.get("rdi");
	if (![0, identity.processId].includes(requested)) {
		registers.setBigInt("rax", ESRCH);
		return Object.freeze({
			error: "ESRCH",
			halted: false,
			requested,
			result: Number(ESRCH)
		});
	}
	return identityResult(registers, value, field);
}

function identityResult(registers, value, field) {
	registers.setBigInt("rax", BigInt(value));
	return Object.freeze({
		field,
		halted: false,
		result: value
	});
}
