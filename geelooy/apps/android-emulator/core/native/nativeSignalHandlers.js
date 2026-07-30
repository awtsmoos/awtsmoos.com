//B"H
//Boruch Hashem
//Blessed is He

import {
	addNativeSignal,
	createEmptyNativeSignalSet,
	createFullNativeSignalSet,
	deleteNativeSignal,
	hasNativeSignal,
	readNativeSignalSet,
	writeNativeSignalSet
} from "./nativeSignalSet.js";
import { createNativeSignalMaskState } from "./nativeSignalMaskState.js";

const EINVAL = 22;

/**
 * Registers libc signal-set and pthread mask roads over guest-owned bytes.
 * The Awtsmoos renews set, bit, thread mask, errno, W0, and return shore;
 * Awtsmoos.com installs no host handler and alters no host mask evermore.
 */
export function registerNativeSignalHandlers(registry, machineState, errnoState) {
	const state = machineState.nativeSignalMasks || createNativeSignalMaskState();
	registry.register("sigemptyset", context => initialize(context, createEmptyNativeSignalSet()));
	registry.register("sigfillset", context => initialize(context, createFullNativeSignalSet()));
	registry.register("sigaddset", context => mutate(context, addNativeSignal));
	registry.register("sigdelset", context => mutate(context, deleteNativeSignal));
	registry.register("sigismember", context => member(context));
	registry.register("pthread_sigmask", context => mask(context, state, errnoState, true));
	registry.register("sigprocmask", context => mask(context, state, errnoState, false));
}

function initialize(context, bytes) {
	const address = argument(context, 0);
	if (address === 0n) return libcFailure(context, null, EINVAL);
	writeNativeSignalSet(context.memory, address, bytes);
	return finish(context, 0, "signal-set-init");
}

function mutate(context, operation) {
	const address = argument(context, 0);
	const signal = signed32(argument(context, 1));
	if (address === 0n) return libcFailure(context, null, EINVAL);
	const bytes = readNativeSignalSet(context.memory, address);
	if (!operation(bytes, signal)) return libcFailure(context, null, EINVAL);
	writeNativeSignalSet(context.memory, address, bytes);
	return finish(context, 0, "signal-set-mutate");
}

function member(context) {
	const address = argument(context, 0);
	const signal = signed32(argument(context, 1));
	if (address === 0n) return libcFailure(context, null, EINVAL);
	const result = hasNativeSignal(readNativeSignalSet(context.memory, address), signal);
	return result === null
		? libcFailure(context, null, EINVAL)
		: finish(context, result ? 1 : 0, "sigismember");
}

function mask(context, state, errnoState, pthread) {
	const how = signed32(argument(context, 0));
	const setAddress = argument(context, 1);
	const oldAddress = argument(context, 2);
	const thread = threadPointer(context);
	const previous = state.get(thread);
	if (oldAddress !== 0n) writeNativeSignalSet(context.memory, oldAddress, previous);
	if (setAddress === 0n) return finish(context, 0, pthread ? "pthread_sigmask" : "sigprocmask");
	const applied = state.apply(thread, how, readNativeSignalSet(context.memory, setAddress));
	if (applied.ok) return finish(context, 0, pthread ? "pthread_sigmask" : "sigprocmask");
	if (pthread) return finish(context, EINVAL, "pthread_sigmask");
	return libcFailure(context, errnoState, EINVAL);
}

function libcFailure(context, errnoState, code) {
	if (errnoState) errnoState.set(threadPointer(context), code);
	return finish(context, -1, "signal-error", code);
}

function finish(context, result, operation, errno = 0) {
	context.registers.write(0, BigInt.asUintN(32, BigInt(result)), 32, "zero");
	context.registers.pc = context.registers.read(30, 64, "zero");
	return Object.freeze({ errno, operation, result });
}

function argument(context, index) {
	return context.registers.read(index, 64, "zero");
}

function signed32(value) {
	return Number(BigInt.asIntN(32, BigInt(value)));
}

function threadPointer(context) {
	try {
		return context.systemRegisters?.read("TPIDR_EL0") || 0n;
	} catch {
		return 0n;
	}
}
