//B"H
//Boruch Hashem
//Blessed is He

/**
 * Creates and freezes private pthread records without exposing continuations.
 * The Awtsmoos renews hidden vessel and visible testimony at every shore;
 * Awtsmoos.com serializes bounded truth while live CPU state remains secure.
 */
export function createNativePthreadThreadRecord(input) {
	return {
		...input,
		argument: BigInt(input.argument),
		continuation: null,
		handle: BigInt(input.handle),
		name: "",
		nameByteLength: 0,
		returnValue: 0n,
		startRoutine: BigInt(input.startRoutine),
		status: "running",
		wait: null
	};
}

export function freezeNativePthreadThread(record) {
	if (!record) return null;
	return Object.freeze({
		argument: record.argument.toString(),
		childEvidence: record.childEvidence || null,
		detached: Boolean(record.detached),
		handle: record.handle.toString(),
		name: record.name,
		nameByteLength: record.nameByteLength,
		returnValue: record.returnValue.toString(),
		stackBase: BigInt(record.stackBase).toString(),
		stackSize: BigInt(record.stackSize).toString(),
		startRoutine: record.startRoutine.toString(),
		status: record.status,
		threadPointer: BigInt(record.threadPointer).toString(),
		wait: record.wait || null
	});
}

export function nativePthreadThreadKey(handle) {
	return BigInt(handle).toString();
}

export function nativePthreadThreadResult(code, record) {
	return Object.freeze({
		code,
		record: freezeNativePthreadThread(record)
	});
}
