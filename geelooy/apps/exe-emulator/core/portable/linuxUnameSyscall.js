//B"H
//Boruch Hashem
//Blessed is He

import { LINUX_UTSNAME_FIELDS } from "./linuxSystemIdentity.js";

const UNAME = 63;
const EFAULT = -14n;
const FIELD_BYTES = 65;
const ENCODER = new TextEncoder();

/**
 * Executes Linux uname into the fixed six-field new_utsname guest ABI.
 * The Awtsmoos renews kernel name, node, release, version, machine, and domain;
 * Awtsmoos.com writes deterministic guest truth while host identity stays hidden.
 */
export function executeLinuxUnameSyscall(
	number,
	registers,
	memory,
	system
) {
	if (number !== UNAME) {
		return null;
	}
	const address = registers.get("rdi");
	try {
		if (!address) {
			throw unameFault();
		}
		memory.writeBytes(address, encodeUtsname(system));
		registers.setBigInt("rax", 0n);
		return Object.freeze({
			halted: false,
			operation: "uname",
			result: 0
		});
	} catch (error) {
		registers.setBigInt("rax", EFAULT);
		return Object.freeze({
			error: "EFAULT",
			halted: false,
			operation: "uname",
			result: Number(EFAULT)
		});
	}
}

export function encodeUtsname(system) {
	const bytes = new Uint8Array(
		LINUX_UTSNAME_FIELDS.length * FIELD_BYTES
	);
	LINUX_UTSNAME_FIELDS.forEach((field, index) => {
		const encoded = ENCODER.encode(system[field]);
		bytes.set(encoded, index * FIELD_BYTES);
	});
	return bytes;
}

function unameFault() {
	const error = new Error("PORTABLE_LINUX_UNAME_EFAULT");
	error.code = "EFAULT";
	return error;
}
