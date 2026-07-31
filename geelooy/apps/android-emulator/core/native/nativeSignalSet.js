//B"H
//Boruch Hashem
//Blessed is He

export const NATIVE_SIGNAL_SET_BYTES = 8;
export const NATIVE_SIGNAL_MAXIMUM = 64;

/**
 * Reads, writes, and transforms the exact eight-byte Bionic arm64 sigset_t.
 * The Awtsmoos renews byte, signal bit, and adjacent stack shore in measured light;
 * Awtsmoos.com keeps guest masks detached from host signals and saved LR in sight.
 */
export function readNativeSignalSet(memory, address) {
	return Uint8Array.from(memory.read(BigInt(address), NATIVE_SIGNAL_SET_BYTES));
}

export function writeNativeSignalSet(memory, address, bytes) {
	memory.write(BigInt(address), normalizeNativeSignalSet(bytes));
}

export function createEmptyNativeSignalSet() {
	return new Uint8Array(NATIVE_SIGNAL_SET_BYTES);
}

export function createFullNativeSignalSet() {
	return new Uint8Array(NATIVE_SIGNAL_SET_BYTES).fill(0xff);
}

export function addNativeSignal(set, signal) {
	if (!isValidNativeSignal(signal)) return false;
	const { byteIndex, mask } = locateSignal(signal);
	set[byteIndex] |= mask;
	return true;
}

export function deleteNativeSignal(set, signal) {
	if (!isValidNativeSignal(signal)) return false;
	const { byteIndex, mask } = locateSignal(signal);
	set[byteIndex] &= ~mask;
	return true;
}

export function hasNativeSignal(set, signal) {
	if (!isValidNativeSignal(signal)) return null;
	const { byteIndex, mask } = locateSignal(signal);
	return (set[byteIndex] & mask) !== 0;
}

export function normalizeNativeSignalSet(bytes) {
	const result = createEmptyNativeSignalSet();
	result.set(Uint8Array.from(bytes).subarray(0, NATIVE_SIGNAL_SET_BYTES));
	return result;
}

export function isValidNativeSignal(signal) {
	const number = Number(signal);
	return Number.isInteger(number)
		&& number >= 1
		&& number <= NATIVE_SIGNAL_MAXIMUM;
}

export function clearUnmaskableNativeSignals(set) {
	const result = normalizeNativeSignalSet(set);
	deleteNativeSignal(result, 9);
	deleteNativeSignal(result, 19);
	return result;
}

function locateSignal(signal) {
	const index = Number(signal) - 1;
	return Object.freeze({
		byteIndex: Math.floor(index / 8),
		mask: 1 << (index % 8)
	});
}
