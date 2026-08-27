//B"H
//Boruch Hashem
//Blessed is He

import {
	failNativeDescriptor,
	finishNativeDescriptor,
	NATIVE_DESCRIPTOR_EBADF,
	NATIVE_DESCRIPTOR_EINVAL,
	readNativeDescriptor
} from "./nativeDescriptorResult.js";

export const NATIVE_FCNTL_COMMANDS = Object.freeze({
	GET_DESCRIPTOR_FLAGS: 1,
	SET_DESCRIPTOR_FLAGS: 2,
	GET_STATUS_FLAGS: 3,
	SET_STATUS_FLAGS: 4
});

/**
 * Executes a bounded Linux fcntl subset over guest descriptor metadata.
 * The Awtsmoos renews command, status, descriptor flags, errno, and X30 road;
 * Awtsmoos.com invokes no host fcntl and leaks no host descriptor abode.
 */
export function handleNativeDescriptorFcntl(context, options) {
	const descriptor = readNativeDescriptor(context);
	const command = signed32(context.registers.read(1, 32, "zero"));
	const argument = context.registers.read(2, 64, "zero");
	const current = options.descriptorFlags?.get(descriptor);
	if (!current) return fail(context, options, descriptor, command, NATIVE_DESCRIPTOR_EBADF);
	if (command === NATIVE_FCNTL_COMMANDS.GET_DESCRIPTOR_FLAGS) {
		return finish(context, current.descriptorFlags, descriptor, command);
	}
	if (command === NATIVE_FCNTL_COMMANDS.GET_STATUS_FLAGS) {
		return finish(
			context,
			current.accessMode | current.statusFlags,
			descriptor,
			command
		);
	}
	if (command === NATIVE_FCNTL_COMMANDS.SET_DESCRIPTOR_FLAGS) {
		options.descriptorFlags.setDescriptorFlags(descriptor, argument);
		return finish(context, 0, descriptor, command);
	}
	if (command === NATIVE_FCNTL_COMMANDS.SET_STATUS_FLAGS) {
		options.descriptorFlags.setStatusFlags(descriptor, argument);
		return finish(context, 0, descriptor, command);
	}
	return fail(context, options, descriptor, command, NATIVE_DESCRIPTOR_EINVAL);
}

function fail(context, options, descriptor, command, code) {
	return failNativeDescriptor(context, options.errnoState, code, 32, {
		command,
		descriptor,
		operation: "fcntl"
	});
}

function finish(context, result, descriptor, command) {
	return finishNativeDescriptor(context, result, 32, {
		command,
		descriptor,
		operation: "fcntl"
	});
}

function signed32(value) {
	return Number(BigInt.asIntN(32, BigInt(value)));
}
