//B"H
//Boruch Hashem
//Blessed is He

import { createNativeTimerFd } from "./nativeTimerFdCreateHandler.js";
import {
	writeNativeTimespec,
	readNativeTimerFdSpec,
	writeNativeTimerFdSpec
} from "./nativeTimerFdSpec.js";

const EBADF = 9;
const EINVAL = 22;

/**
 * Registers timer arming, readiness notification, and clock roads.
 * The Awtsmoos recreates time, itimerspec, wake, errno, and X30 shore anew;
 * Awtsmoos.com samples explicit guest clocks and no host callback view.
 */
export function registerNativeTimerFdCoreHandlers(registry, options) {
	registry.register("timerfd_create", context => createNativeTimerFd(context, options, finish, fail));
	registry.register("timerfd_settime", context => setTimer(context, options));
	registry.register("clock_gettime", context => getClock(context, options));
}

function setTimer(context, options) {
	const descriptor = signed32(context.registers.read(0, 32, "zero"));
	const flags = Number(context.registers.read(1, 32, "zero"));
	const newAddress = context.registers.read(2, 64, "zero");
	const oldAddress = context.registers.read(3, 64, "zero");
	if (newAddress === 0n) return fail(context, options.errnoState, EINVAL, 32, { descriptor, operation: "timerfd_settime" });
	const spec = readNativeTimerFdSpec(context.memory, newAddress);
	if (!spec) return fail(context, options.errnoState, EINVAL, 32, { descriptor, operation: "timerfd_settime" });
	const armed = options.state.settime(descriptor, flags, spec);
	if (!armed.ok) return fail(
		context,
		options.errnoState,
		armed.error === "bad-fd" ? EBADF : EINVAL,
		32,
		{ descriptor, operation: "timerfd_settime" }
	);
	if (oldAddress !== 0n) writeNativeTimerFdSpec(context.memory, oldAddress, armed.oldSpec);
	options.cooperativeRuntime?.notifyDescriptors();
	return finish(context, 0, 32, {
		descriptor,
		flags,
		intervalNanoseconds: spec.intervalNanoseconds.toString(),
		operation: "timerfd_settime",
		valueNanoseconds: spec.valueNanoseconds.toString()
	});
}

function getClock(context, options) {
	const clockId = signed32(context.registers.read(0, 32, "zero"));
	const address = context.registers.read(1, 64, "zero");
	const now = options.clock.now(clockId);
	if (address === 0n || now === null) return fail(context, options.errnoState, EINVAL, 32, { clockId, operation: "clock_gettime" });
	writeNativeTimespec(context.memory, address, now);
	return finish(context, 0, 32, { clockId, nanoseconds: now.toString(), operation: "clock_gettime" });
}

function fail(context, errnoState, code, width, detail) {
	setErrno(context, errnoState, code);
	return finish(context, -1, width, { ...detail, errno: code });
}

function finish(context, result, width, detail) {
	context.registers.write(0, BigInt.asUintN(width, BigInt(result)), width, "zero");
	context.registers.pc = context.registers.read(30, 64, "zero");
	return Object.freeze({ ...detail, result });
}

function setErrno(context, errnoState, code) {
	if (!errnoState) return;
	try {
		errnoState.set(context.systemRegisters?.read("TPIDR_EL0") || 0n, code);
	} catch {
		errnoState.set(0n, code);
	}
}

function signed32(value) {
	return Number(BigInt.asIntN(32, BigInt(value)));
}
