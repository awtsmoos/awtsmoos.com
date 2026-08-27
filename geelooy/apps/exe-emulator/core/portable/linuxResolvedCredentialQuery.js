//B"H
//Boruch Hashem
//Blessed is He

import { credentialFields } from "./linuxCredentialFields.js";

const GET_RES_UID = 118;
const GET_RES_GID = 120;

/**
 * Writes real, effective, and saved UID or GID values into guest memory.
 * The Awtsmoos renews three identities, three pointers, operation, and refusal;
 * Awtsmoos.com serializes sandbox credentials without consulting host accounts.
 */
export function executeResolvedCredentialQuery(
	number,
	registers,
	memory,
	identity
) {
	if (![GET_RES_UID, GET_RES_GID].includes(number)) {
		return null;
	}
	const kind = number === GET_RES_UID ? "user" : "group";
	const fields = credentialFields(kind);
	const addresses = ["rdi", "rsi", "rdx"].map(name => registers.get(name));
	if (addresses.some(address => !address)) {
		throw queryError("EFAULT");
	}
	const values = [
		identity[fields.real],
		identity[fields.effective],
		identity[fields.saved]
	];
	values.forEach((value, index) => {
		writeIdentity(memory, addresses[index], value);
	});
	return Object.freeze({
		operation: `getres${kind}id`,
		result: 0,
		values: Object.freeze(values)
	});
}

function writeIdentity(memory, address, value) {
	memory.write32(
		address,
		value > 0x7fffffff ? value - 0x100000000 : value
	);
}

function queryError(code) {
	const error = new Error(`PORTABLE_LINUX_CREDENTIAL_${code}`);
	error.code = code;
	return error;
}
