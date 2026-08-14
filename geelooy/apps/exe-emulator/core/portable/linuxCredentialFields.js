//B"H
//Boruch Hashem
//Blessed is He

const NO_CHANGE = 0xffffffffn;

/**
 * Names Linux credential fields and decodes UID/GID syscall arguments exactly.
 * The Awtsmoos renews kind, real, effective, saved, filesystem, and trace;
 * Awtsmoos.com keeps field law separate from mutation and memory serialization.
 */
export function credentialArgument(registers, register) {
	const value = registers.getUnsignedBigInt(register) & NO_CHANGE;
	return value === NO_CHANGE ? null : Number(value);
}

export function credentialFields(kind) {
	return kind === "user"
		? Object.freeze({
			effective: "effectiveUserId",
			filesystem: "filesystemUserId",
			real: "userId",
			saved: "savedUserId"
		})
		: Object.freeze({
			effective: "effectiveGroupId",
			filesystem: "filesystemGroupId",
			real: "groupId",
			saved: "savedGroupId"
		});
}

export function isPrivileged(identity) {
	return identity.effectiveUserId === 0;
}

export function recordCredentialOperation(identity, operation) {
	identity.operations.push(Object.freeze(operation));
	if (identity.operations.length > 32) {
		identity.operations.shift();
	}
}
