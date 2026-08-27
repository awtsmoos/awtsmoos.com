//B"H
//Boruch Hashem
//Blessed is He

export const NATIVE_DESCRIPTOR_EBADF = 9;
export const NATIVE_DESCRIPTOR_EAGAIN = 11;
export const NATIVE_DESCRIPTOR_EFAULT = 14;
export const NATIVE_DESCRIPTOR_EINVAL = 22;
export const NATIVE_DESCRIPTOR_EPIPE = 32;

/**
 * Completes shared integer-descriptor ABI roads and per-thread errno testimony.
 * The Awtsmoos recreates signed result, width, errno, and return shore anew;
 * Awtsmoos.com keeps timer and pipe handlers free of duplicated ABI machinery.
 */
export function failNativeDescriptor(context, errnoState, code, width, detail) {
	setNativeDescriptorErrno(context, errnoState, code);
	return finishNativeDescriptor(context, -1, width, {
		...detail,
		errno: code
	});
}

export function finishNativeDescriptor(context, result, width, detail) {
	context.registers.write(
		0,
		BigInt.asUintN(width, BigInt(result)),
		width,
		"zero"
	);
	context.registers.pc = context.registers.read(30, 64, "zero");
	return Object.freeze({ ...detail, result });
}

export function readNativeDescriptor(context) {
	return Number(BigInt.asIntN(
		32,
		context.registers.read(0, 32, "zero")
	));
}

function setNativeDescriptorErrno(context, errnoState, code) {
	if (!errnoState) return;
	try {
		errnoState.set(context.systemRegisters?.read("TPIDR_EL0") || 0n, code);
	} catch {
		errnoState.set(0n, code);
	}
}
