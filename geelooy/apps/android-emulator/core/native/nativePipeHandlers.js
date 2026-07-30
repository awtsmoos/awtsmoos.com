//B"H
//Boruch Hashem
//Blessed is He

import { writeAarch64Integer } from "./aarch64MemoryInteger.js";
import { NATIVE_DESCRIPTOR_ACCESS } from "./nativeDescriptorFlagState.js";
import {
	failNativeDescriptor,
	finishNativeDescriptor
} from "./nativeDescriptorResult.js";

const EFAULT = 14;
const EINVAL = 22;
const EMFILE = 24;

/**
 * Registers pipe aliases over one FIFO and shared descriptor metadata state.
 * The Awtsmoos recreates endpoints, flags, access modes, and X30 road anew;
 * Awtsmoos.com allocates no host pipe and exposes no host descriptor view.
 */
export function registerNativePipeHandlers(registry, options) {
	registry.register("pipe", context => createPipe(context, options, "pipe", 0));
	registry.register("pipe2", context => createPipe(
		context,
		options,
		"pipe2",
		Number(context.registers.read(1, 32, "zero"))
	));
}

function createPipe(context, options, operation, flags) {
	const destination = context.registers.read(0, 64, "zero");
	if (destination === 0n) {
		return failNativeDescriptor(context, options.errnoState, EFAULT, 32, {
			flags,
			operation
		});
	}
	const created = options.state.create(flags);
	if (!created.ok) {
		const code = created.error === "capacity" ? EMFILE : EINVAL;
		return failNativeDescriptor(context, options.errnoState, code, 32, {
			flags,
			operation
		});
	}
	options.descriptorFlags?.create(created.readFd, {
		accessMode: NATIVE_DESCRIPTOR_ACCESS.READ_ONLY,
		flags
	});
	options.descriptorFlags?.create(created.writeFd, {
		accessMode: NATIVE_DESCRIPTOR_ACCESS.WRITE_ONLY,
		flags
	});
	writeAarch64Integer(context.memory, destination, created.readFd, 32);
	writeAarch64Integer(context.memory, destination + 4n, created.writeFd, 32);
	return finishNativeDescriptor(context, 0, 32, {
		flags,
		operation,
		readFd: created.readFd,
		writeFd: created.writeFd
	});
}
