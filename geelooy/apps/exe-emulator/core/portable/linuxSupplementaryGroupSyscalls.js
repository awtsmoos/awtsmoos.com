//B"H
//Boruch Hashem
//Blessed is He

import { isPrivileged } from "./linuxCredentialFields.js";

const GET_GROUPS = 115;
const SET_GROUPS = 116;

/**
 * Executes Linux supplementary-group read and replacement through guest memory.
 * The Awtsmoos renews group count, list, privilege, capacity, and exact bytes;
 * Awtsmoos.com never reads or mutates host supplementary groups.
 */
export function executeSupplementaryGroupSyscall(
	number,
	registers,
	memory,
	identity
) {
	if (![GET_GROUPS, SET_GROUPS].includes(number)) {
		return null;
	}
	return number === GET_GROUPS
		? getGroups(registers, memory, identity)
		: setGroups(registers, memory, identity);
}

function getGroups(registers, memory, identity) {
	const size = registers.get("rdi");
	const address = registers.get("rsi");
	const groups = identity.supplementaryGroups;
	if (size === 0) {
		return result("getgroups", groups.length);
	}
	if (size < groups.length) {
		throw groupError("EINVAL");
	}
	if (groups.length && !address) {
		throw groupError("EFAULT");
	}
	groups.forEach((group, index) => {
		writeIdentity(memory, address + index * 4, group);
	});
	return result("getgroups", groups.length);
}

function setGroups(registers, memory, identity) {
	if (!isPrivileged(identity)) {
		throw groupError("EPERM");
	}
	const size = registers.get("rdi");
	const address = registers.get("rsi");
	if (size > 64) {
		throw groupError("EINVAL");
	}
	if (size && !address) {
		throw groupError("EFAULT");
	}
	identity.supplementaryGroups = Array.from(
		{ length: size },
		(_, index) => memory.u32(address + index * 4)
	);
	return result("setgroups", 0);
}

function result(operation, value) {
	return Object.freeze({
		operation,
		result: value
	});
}

function writeIdentity(memory, address, value) {
	memory.write32(
		address,
		value > 0x7fffffff ? value - 0x100000000 : value
	);
}

function groupError(code) {
	const error = new Error(`PORTABLE_LINUX_GROUP_${code}`);
	error.code = code;
	return error;
}
