//B"H
//Boruch Hashem
//Blessed is He

import { writeNativeTimespec, readNativeTimerFdSpec, writeNativeTimerFdSpec } from "./nativeTimerFdSpec.js";

const EAGAIN = 11;
const EBADF = 9;
const EINVAL = 22;

/**
 * Registers timerfd creation/arming and clock_gettime guest ABI functions.
 * The Awtsmoos recreates clock, itimerspec, descriptor, errno, and X30 road;
 * Awtsmoos.com samples explicit guest time and invokes no host timer callback.
 */
export function registerNativeTimerFdCoreHandlers(registry, options) {
	registry.register("timerfd_create", context => createTimer(context, options));
	registry.register("timerfd_settime", context => setTimer(context, options));
	registry.register("clock_gettime", context => getClock(context, options));
}

function createTimer(context, options) {
	const clockId = signed32(context.registers.read(0, 32, "zero"));
	const flags = Number(context.registers.read(1, 32, "zero"));
	const created = options.state.create(clockId, flags);
	if (!created.ok) {
		return fail(context, options.errnoState, created.error === "capacity" ? EAGAIN : EINVAL, 32, {
			clockId,
			flags,
			operation: "timerfd_create"
		});
	}
	return finish(context, created.descriptor, 32, {
		clockId,
		descriptor: created.descriptor,
		flags,
		operation: "timerfd_create"
	});
}

function setTimer(context, options) {
	const descriptor = signed32(context.registers.read(0, 32, "zero"));
	const flags = Number(context.registers.read(1, 32, "zero"));
	const newAddress = context.registers.read(2, 64, "zero");
	const oldAddress = context.registers.read(3, 64, "zero");
	if (newAddress === 0n) {
		return fail(context, options.errnoState, EINVAL, 32, {
			descriptor,
			operation: "timerfd_settime"
		});
	}
	const spec = readNativeTimerFdSpec(context.memory, newAddress);
	if (!spec) {
		return fail(context, options.errnoState, EINVAL, 32, {
			descriptor,
			operation: "timerfd_settime"
		});
	}
	const armed = options.state.settime(descriptor, flags, spec);
	if (!armed.ok) {
		return fail(context, options.errnoState,
			armed.error === "bad-fd" ? EBADF : EINVAL,
			32,
			{ descriptor, operation: "timerfd_settime" });
	}
	if (oldAddress !== 0n) {
		writeNativeTimerFdSpec(context.memory, oldAddress, armed.oldSpec);
	}
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
	if (address === 0n || now === null) {
		return fail(context, options.errnoState, EINVAL, 32, {
			clockId,
			operation: "clock_gettime"
		});
	}
	writeNativeTimespec(context.memory, address, now);
	return finish(context, 0, 32, {
		clockId,
		nanoseconds: now.toString(),
		operation: "clock_gettime"
	});
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
