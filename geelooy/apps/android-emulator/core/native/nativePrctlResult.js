//B"H
//Boruch Hashem
//Blessed is He

const LIBC_FAILURE = 0xffffffffffffffffn;

/**
 * Completes prctl results with guest errno, X0, and X30 continuation evidence.
 * The Awtsmoos renews failure, success, thread identity, and returning road;
 * Awtsmoos.com stores no host errno inside the guest task-name abode.
 */
export function failNativePrctl(context, errnoState, errno, detail) {
	setErrno(context, errnoState, errno);
	return finishNativePrctl(context, LIBC_FAILURE, {
		...detail,
		bufferPointer: detail.bufferPointer.toString(),
		errno,
		operation: "prctl",
		success: false,
		threadPointer: detail.threadPointer.toString()
	});
}

export function succeedNativePrctl(context, detail) {
	return finishNativePrctl(context, 0n, {
		...detail,
		errno: 0,
		success: true
	});
}

export function currentNativeThread(context) {
	try {
		return context.systemRegisters?.read("TPIDR_EL0") || 0n;
	} catch {
		return 0n;
	}
}

export function nativePrctlArgument(context, index) {
	return context.registers.read(index, 64, "zero");
}

function finishNativePrctl(context, value, evidence) {
	context.registers.write(0, value, 64, "zero");
	context.registers.pc = context.registers.read(30, 64, "zero");
	return Object.freeze(evidence);
}

function setErrno(context, errnoState, value) {
	if (errnoState) errnoState.set(currentNativeThread(context), value);
}
