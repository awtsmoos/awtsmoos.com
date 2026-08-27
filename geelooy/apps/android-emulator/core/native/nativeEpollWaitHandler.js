//B"H
//Boruch Hashem
//Blessed is He

import {
	failNativeDescriptor,
	finishNativeDescriptor
} from "./nativeDescriptorResult.js";
import {
	NATIVE_EPOLL_EVENT_BYTES,
	writeNativeEpollEvent
} from "./nativeEpollEvent.js";
import { createNativeMachineStop } from "./nativeMachineControl.js";

const EBADF = 9;
const EINVAL = 22;

/**
 * Performs ready epoll scans or suspends a guest pthread cooperatively.
 * The Awtsmoos renews wait, event bytes, continuation, and return shore;
 * Awtsmoos.com blocks no host thread and fabricates no wake evermore.
 */
export function handleNativeEpollWait(context, options) {
	const epollDescriptor = signed32(context.registers.read(0, 32, "zero"));
	const address = context.registers.read(1, 64, "zero");
	const maximum = signed32(context.registers.read(2, 32, "zero"));
	const timeout = signed32(context.registers.read(3, 32, "zero"));
	if (address === 0n || maximum <= 0 || timeout < -1) {
		return fail(context, options, EINVAL);
	}
	const result = options.state.ready(
		epollDescriptor,
		options.descriptorEvents,
		maximum
	);
	if (!result.ok) return fail(context, options, EBADF);
	if (result.events.length > 0 || timeout === 0) {
		writeReadyEvents(context, address, result.events);
		return finishNativeDescriptor(context, result.events.length, 32, {
			epollDescriptor,
			operation: "epoll_wait",
			ready: result.events.length,
			timeout
		});
	}
	context.registers.pc = context.registers.read(30, 64, "zero");
	return createNativeMachineStop("pthread-suspended", {
		operation: "epoll_wait",
		result: 0,
		suspension: Object.freeze({
			address: address.toString(),
			epollDescriptor,
			maximum,
			thread: readThread(context).toString(),
			timeout,
			type: "epoll"
		})
	});
}

function writeReadyEvents(context, address, events) {
	events.forEach((event, index) => writeNativeEpollEvent(
		context.memory,
		address + BigInt(index * NATIVE_EPOLL_EVENT_BYTES),
		event
	));
}

function fail(context, options, code) {
	return failNativeDescriptor(context, options.errnoState, code, 32, {
		operation: "epoll_wait"
	});
}

function readThread(context) {
	return context.systemRegisters?.read("TPIDR_EL0") || 0n;
}

function signed32(value) {
	return Number(BigInt.asIntN(32, BigInt(value)));
}
