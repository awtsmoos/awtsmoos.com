//B"H
//Boruch Hashem
//Blessed is He

import {
	credentialFields,
	isPrivileged
} from "./linuxCredentialFields.js";

/**
 * Applies Linux UID/GID transitions to one deterministic sandbox credential set.
 * The Awtsmoos renews real, effective, saved, filesystem, privilege, and refusal;
 * Awtsmoos.com enforces guest credential law without changing the host user.
 */
export function applyCredentialSingle(identity, kind, value) {
	const fields = credentialFields(kind);
	if (isPrivileged(identity)) {
		setFields(identity, fields, value, value, value);
		identity[fields.filesystem] = value;
		return true;
	}
	if (![identity[fields.real], identity[fields.saved]].includes(value)) {
		return false;
	}
	identity[fields.effective] = value;
	identity[fields.filesystem] = value;
	return true;
}

export function applyCredentialPair(identity, kind, real, effective) {
	const fields = credentialFields(kind);
	if (!argumentsAllowed(identity, fields, [real, effective])) {
		return false;
	}
	const realChanged = real !== null;
	const effectiveChanged = effective !== null;
	if (realChanged) {
		identity[fields.real] = real;
	}
	if (effectiveChanged) {
		identity[fields.effective] = effective;
		identity[fields.filesystem] = effective;
	}
	if (realChanged || effectiveChanged) {
		identity[fields.saved] = identity[fields.effective];
	}
	return true;
}

export function applyCredentialTriple(identity, kind, real, effective, saved) {
	const fields = credentialFields(kind);
	if (!argumentsAllowed(identity, fields, [real, effective, saved])) {
		return false;
	}
	if (real !== null) {
		identity[fields.real] = real;
	}
	if (effective !== null) {
		identity[fields.effective] = effective;
		identity[fields.filesystem] = effective;
	}
	if (saved !== null) {
		identity[fields.saved] = saved;
	}
	return true;
}

export function applyFilesystemCredential(identity, kind, value) {
	const fields = credentialFields(kind);
	const previous = identity[fields.filesystem];
	if (isPrivileged(identity)
		|| credentialValues(identity, fields).includes(value)) {
		identity[fields.filesystem] = value;
	}
	return previous;
}

function argumentsAllowed(identity, fields, values) {
	if (isPrivileged(identity)) {
		return true;
	}
	const allowed = credentialValues(identity, fields);
	return values.every(value => value === null || allowed.includes(value));
}

function credentialValues(identity, fields) {
	return [
		identity[fields.real],
		identity[fields.effective],
		identity[fields.saved]
	];
}

function setFields(identity, fields, real, effective, saved) {
	identity[fields.real] = real;
	identity[fields.effective] = effective;
	identity[fields.saved] = saved;
}
