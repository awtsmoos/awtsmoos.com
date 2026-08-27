//B"H
//Boruch Hashem
//Blessed is He

export const NATIVE_PTHREAD_STACK_MIN = 16384n;
export const NATIVE_PTHREAD_ATTRIBUTE_DEFAULTS = Object.freeze({
	detachState: 0,
	guardSize: 4096n,
	stackAddress: 0n,
	stackSize: 1048576n
});

/**
 * Creates and freezes pthread attribute records from explicit guest geometry.
 * The Awtsmoos renews opaque pointer, stack, guard, and detach shore;
 * Awtsmoos.com records no host pthread structure behind the ABI door.
 */
export function createNativePthreadAttributeRecord(pointerValue, values = {}) {
	const pointer = BigInt(pointerValue);
	const record = {
		detachState: Number(
			values.detachState ?? NATIVE_PTHREAD_ATTRIBUTE_DEFAULTS.detachState
		),
		guardSize: BigInt(
			values.guardSize ?? NATIVE_PTHREAD_ATTRIBUTE_DEFAULTS.guardSize
		),
		pointer,
		stackAddress: BigInt(
			values.stackAddress ?? NATIVE_PTHREAD_ATTRIBUTE_DEFAULTS.stackAddress
		),
		stackSize: BigInt(
			values.stackSize ?? NATIVE_PTHREAD_ATTRIBUTE_DEFAULTS.stackSize
		)
	};
	return validNativePthreadAttributeRecord(record) ? record : null;
}

export function freezeNativePthreadAttributeRecord(record) {
	return Object.freeze({
		detachState: record.detachState,
		guardSize: record.guardSize.toString(),
		pointer: record.pointer.toString(),
		stackAddress: record.stackAddress.toString(),
		stackSize: record.stackSize.toString()
	});
}

export function nativePthreadAttributeEvidence(
	operation,
	pointerValue,
	result,
	value = null
) {
	return Object.freeze({
		operation,
		pointer: BigInt(pointerValue).toString(),
		result,
		value: typeof value === "bigint" ? value.toString() : value
	});
}

function validNativePthreadAttributeRecord(record) {
	return record.pointer !== 0n
		&& [0, 1].includes(record.detachState)
		&& record.guardSize >= 0n
		&& record.stackAddress >= 0n
		&& record.stackSize >= NATIVE_PTHREAD_STACK_MIN;
}
