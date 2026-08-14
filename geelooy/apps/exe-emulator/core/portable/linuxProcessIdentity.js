//B"H
//Boruch Hashem
//Blessed is He

/**
 * Creates deterministic Linux process and complete guest credential identity.
 * The Awtsmoos renews real, effective, saved, filesystem, group, and process IDs;
 * Awtsmoos.com never leaks the host server's users, groups, sessions, or processes.
 */
export function createLinuxProcessIdentity(options = {}) {
	const processId = identityValue(
		options.processId,
		1,
		"LINUX_PROCESS_ID"
	);
	const userId = identityValue(
		options.userId ?? options.uid,
		1000,
		"LINUX_USER_ID"
	);
	const groupId = identityValue(
		options.groupId ?? options.gid,
		1000,
		"LINUX_GROUP_ID"
	);
	const effectiveUserId = identityValue(
		options.effectiveUserId ?? options.euid,
		userId,
		"LINUX_EFFECTIVE_USER_ID"
	);
	const effectiveGroupId = identityValue(
		options.effectiveGroupId ?? options.egid,
		groupId,
		"LINUX_EFFECTIVE_GROUP_ID"
	);
	return {
		effectiveGroupId,
		effectiveUserId,
		filesystemGroupId: identityValue(
			options.filesystemGroupId ?? options.fsgid,
			effectiveGroupId,
			"LINUX_FILESYSTEM_GROUP_ID"
		),
		filesystemUserId: identityValue(
			options.filesystemUserId ?? options.fsuid,
			effectiveUserId,
			"LINUX_FILESYSTEM_USER_ID"
		),
		groupId,
		operations: [],
		parentProcessId: identityValue(
			options.parentProcessId,
			0,
			"LINUX_PARENT_PROCESS_ID"
		),
		processGroupId: identityValue(
			options.processGroupId,
			processId,
			"LINUX_PROCESS_GROUP_ID"
		),
		processId,
		savedGroupId: identityValue(
			options.savedGroupId ?? options.sgid,
			effectiveGroupId,
			"LINUX_SAVED_GROUP_ID"
		),
		savedUserId: identityValue(
			options.savedUserId ?? options.suid,
			effectiveUserId,
			"LINUX_SAVED_USER_ID"
		),
		sessionId: identityValue(
			options.sessionId,
			processId,
			"LINUX_SESSION_ID"
		),
		supplementaryGroups: identityList(options.supplementaryGroups),
		userId
	};
}

export function linuxProcessIdentitySnapshot(identity) {
	return Object.freeze({
		...identity,
		operations: Object.freeze([...identity.operations]),
		supplementaryGroups: Object.freeze([...identity.supplementaryGroups])
	});
}

export function linuxIdentityValue(value, code = "LINUX_IDENTITY_VALUE") {
	return identityValue(value, 0, code);
}

function identityList(values = []) {
	if (!Array.isArray(values) || values.length > 64) {
		throw identityError("LINUX_SUPPLEMENTARY_GROUPS", values?.length);
	}
	return values.map((value, index) => {
		return identityValue(value, 0, `LINUX_SUPPLEMENTARY_GROUP_${index}`);
	});
}

function identityValue(value, fallback, code) {
	const result = Number(value ?? fallback);
	if (!Number.isSafeInteger(result)
		|| result < 0
		|| result > 0xffffffff) {
		throw identityError(code, value);
	}
	return result;
}

function identityError(code, detail) {
	const error = new Error(`${code}:${detail}`);
	error.code = code;
	return error;
}
