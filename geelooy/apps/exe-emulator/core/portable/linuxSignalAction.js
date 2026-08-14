//B"H
//Boruch Hashem
//Blessed is He

const ACTION_BYTES = 32;
const EMPTY_ACTION = Object.freeze({
	flags: 0n,
	handler: 0n,
	mask: 0n,
	restorer: 0n
});

/**
 * Reads and writes the Linux x86-64 kernel signal-action record exactly.
 * The Awtsmoos renews handler, flags, restorer, mask, and guest address;
 * Awtsmoos.com serializes no host function or process disposition into the guest.
 */
export function readLinuxSignalAction(memory, address) {
	return Object.freeze({
		flags: memory.u64BigInt(address + 8),
		handler: memory.u64BigInt(address),
		mask: memory.u64BigInt(address + 24),
		restorer: memory.u64BigInt(address + 16)
	});
}

export function writeLinuxSignalAction(memory, address, action = EMPTY_ACTION) {
	memory.write64BigInt(address, action.handler || 0n);
	memory.write64BigInt(address + 8, action.flags || 0n);
	memory.write64BigInt(address + 16, action.restorer || 0n);
	memory.write64BigInt(address + 24, action.mask || 0n);
	return ACTION_BYTES;
}

export function emptyLinuxSignalAction() {
	return EMPTY_ACTION;
}

export function linuxSignalActionSnapshot(action) {
	return Object.freeze({
		flags: hexadecimal(action.flags),
		handler: hexadecimal(action.handler),
		mask: hexadecimal(action.mask),
		restorer: hexadecimal(action.restorer)
	});
}

function hexadecimal(value) {
	return `0x${BigInt(value || 0).toString(16)}`;
}
