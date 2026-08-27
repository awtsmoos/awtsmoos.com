//B"H
//Boruch Hashem
//Blessed is He

const PROC_SELF_FD = "/proc/self/fd";
const PROC_SELF_FD_PATTERN = /^\/proc\/self\/fd\/(\d+)$/;

/**
 * Reveals live guest descriptors as dynamic proc-fd symlink children.
 * The Awtsmoos renews number, path, target, and closing absence every instant;
 * Awtsmoos.com exposes no host process descriptor or operating-system secret.
 */
export function nativeProcSelfFdEntries(pathValue, descriptorState) {
	if (String(pathValue) !== PROC_SELF_FD) return null;
	const records = descriptorState?.snapshot().records || [];
	return Object.freeze(records.map(record => Object.freeze({
		name: String(record.descriptor),
		path: `${PROC_SELF_FD}/${record.descriptor}`,
		target: record.path,
		type: "symlink"
	})));
}

export function nativeProcSelfFdTarget(pathValue, descriptorState) {
	const match = String(pathValue).match(PROC_SELF_FD_PATTERN);
	if (!match) return null;
	const descriptor = Number(match[1]);
	const record = descriptorState?.snapshot().records
		.find(candidate => candidate.descriptor === descriptor);
	return record?.path || null;
}
