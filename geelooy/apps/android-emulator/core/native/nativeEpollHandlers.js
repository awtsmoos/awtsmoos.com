//B"H
//Boruch Hashem
//Blessed is He

import { NATIVE_DESCRIPTOR_ACCESS } from "./nativeDescriptorFlagState.js";
import {
	failNativeDescriptor,
	finishNativeDescriptor
} from "./nativeDescriptorResult.js";
import { readNativeEpollEvent } from "./nativeEpollEvent.js";
import { handleNativeEpollWait } from "./nativeEpollWaitHandler.js";

const EBADF = 9;
const EEXIST = 17;
const EINVAL = 22;
const ENOENT = 2;

/**
 * Registers guest epoll creation, control, and cooperative waiting roads.
 * The Awtsmoos renews interest, descriptor, errno, and X30 shore anew;
 * Awtsmoos.com invokes no host poller and exposes no host descriptor view.
 */
export function registerNativeEpollHandlers(registry, options) {
	registry.register("epoll_create", context => create(context, options, false));
	registry.register("epoll_create1", context => create(context, options, true));
	registry.register("epoll_ctl", context => control(context, options));
	registry.register("epoll_wait", context => handleNativeEpollWait(context, options));
}

function create(context, options, modern) {
	const value = signed32(context.registers.read(0, 32, "zero"));
	if ((!modern && value <= 0) || (modern && (value & ~0x80000) !== 0)) {
		return fail(context, options, EINVAL, "epoll-create");
	}
	const created = options.state.create();
	if (!created.ok) return fail(context, options, EINVAL, "epoll-create");
	options.descriptorFlags?.create(created.descriptor, {
		accessMode: NATIVE_DESCRIPTOR_ACCESS.READ_ONLY,
		flags: modern ? value : 0
	});
	return finishNativeDescriptor(context, created.descriptor, 32, {
		descriptor: created.descriptor,
		operation: modern ? "epoll_create1" : "epoll_create"
	});
}

function control(context, options) {
	const epollDescriptor = signed32(context.registers.read(0, 32, "zero"));
	const operation = signed32(context.registers.read(1, 32, "zero"));
	const descriptor = signed32(context.registers.read(2, 32, "zero"));
	const address = context.registers.read(3, 64, "zero");
	const event = operation === 2 || address === 0n
		? null
		: readNativeEpollEvent(context.memory, address);
	const result = options.state.control(epollDescriptor, operation, descriptor, event);
	if (!result.ok) return fail(context, options, controlErrno(result.error), "epoll_ctl");
	return finishNativeDescriptor(context, 0, 32, {
		descriptor,
		epollDescriptor,
		operation
	});
}

function fail(context, options, code, operation) {
	return failNativeDescriptor(context, options.errnoState, code, 32, { operation });
}

function controlErrno(error) {
	if (error === "exists") return EEXIST;
	if (error === "missing") return ENOENT;
	if (error === "bad-epoll") return EBADF;
	return EINVAL;
}

function signed32(value) {
	return Number(BigInt.asIntN(32, BigInt(value)));
}
