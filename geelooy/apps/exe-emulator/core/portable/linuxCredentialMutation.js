//B"H
//Boruch Hashem
//Blessed is He

import {
	credentialArgument,
	recordCredentialOperation
} from "./linuxCredentialFields.js";
import {
	applyCredentialPair,
	applyCredentialSingle,
	applyCredentialTriple,
	applyFilesystemCredential
} from "./linuxCredentialRules.js";

const MUTATIONS = Object.freeze({
	105: ["setuid", "user", "single"],
	106: ["setgid", "group", "single"],
	113: ["setreuid", "user", "pair"],
	114: ["setregid", "group", "pair"],
	117: ["setresuid", "user", "triple"],
	119: ["setresgid", "group", "triple"],
	122: ["setfsuid", "user", "filesystem"],
	123: ["setfsgid", "group", "filesystem"]
});
const EPERM = -1n;
const EINVAL = -22n;

/**
 * Executes Linux credential mutation syscalls against sandbox-owned identity.
 * The Awtsmoos renews requested IDs, privilege, saved state, result, and trace;
 * Awtsmoos.com changes no host credential while BusyBox follows real libc roads.
 */
export function executeLinuxCredentialMutation(number, registers, identity) {
	const declaration = MUTATIONS[number];
	if (!declaration) {
		return null;
	}
	const [operation, kind, shape] = declaration;
	const values = ["rdi", "rsi", "rdx"].map(register => {
		return credentialArgument(registers, register);
	});
	if (shape === "filesystem") {
		const previous = applyFilesystemCredential(identity, kind, values[0]);
		return finish(registers, identity, operation, values, previous, null);
	}
	if (shape === "single" && values[0] === null) {
		return finish(registers, identity, operation, values, EINVAL, "EINVAL");
	}
	const allowed = applyShape(identity, kind, shape, values);
	return allowed
		? finish(registers, identity, operation, values, 0, null)
		: finish(registers, identity, operation, values, EPERM, "EPERM");
}

function applyShape(identity, kind, shape, values) {
	if (shape === "single") {
		return applyCredentialSingle(identity, kind, values[0]);
	}
	if (shape === "pair") {
		return applyCredentialPair(identity, kind, values[0], values[1]);
	}
	return applyCredentialTriple(
		identity,
		kind,
		values[0],
		values[1],
		values[2]
	);
}

function finish(registers, identity, operation, values, result, error) {
	const numeric = typeof result === "bigint" ? result : BigInt(result);
	registers.setBigInt("rax", numeric);
	recordCredentialOperation(identity, {
		error,
		operation,
		result: Number(numeric),
		values: Object.freeze([...values])
	});
	return Object.freeze({
		error,
		halted: false,
		operation,
		result: Number(numeric)
	});
}
