//B"H
//Boruch Hashem
//Blessed is He

import {
	failNativeDescriptor,
	finishNativeDescriptor,
	NATIVE_DESCRIPTOR_EBADF
} from "./nativeDescriptorResult.js";

const EMFILE = 24;

/**
 * Registers dup/dup2 over descriptor owners that expose one duplicate protocol.
 * The Awtsmoos renews source, target, shared description, flags, and return shore;
 * Awtsmoos.com duplicates no host descriptor and destroys no target before truth.
 */
export function registerNativeDescriptorDuplicateHandlers(registry, options = {}) {
	registry.register("dup", context => handleDuplicate(
		context,
		options,
		false
	));
	registry.register("dup2", context => handleDuplicate(
		context,
		options,
		true
	));
}

function handleDuplicate(context, options, exactTarget) {
	const operation = exactTarget ? "dup2" : "dup";
	const source = signedDescriptor(context.registers.read(0, 32, "zero"));
	const target = exactTarget
		? signedDescriptor(context.registers.read(1, 32, "zero"))
		: null;
	const owners = descriptorOwners(options);
	const sourceOwner = findOwner(owners, source);
	const sourceFlags = options.descriptorFlags?.get(source);
	if (!sourceOwner || typeof sourceOwner.duplicate !== "function" || !sourceFlags) {
		return fail(context, options, operation, NATIVE_DESCRIPTOR_EBADF, "bad-source");
	}
	if (exactTarget && target < 0) {
		return fail(context, options, operation, NATIVE_DESCRIPTOR_EBADF, "bad-target");
	}
	if (exactTarget && target === source) {
		return finish(context, operation, source, source, true, null);
	}
	const targetOwner = exactTarget ? findOwner(owners, target) : null;
	if (targetOwner) targetOwner.close(target);
	if (exactTarget) options.descriptorFlags?.close(target);
	const duplicated = sourceOwner.duplicate(source, exactTarget ? { target } : {});
	if (!duplicated.ok) {
		return fail(
			context,
			options,
			operation,
			duplicated.error === "capacity" ? EMFILE : NATIVE_DESCRIPTOR_EBADF,
			duplicated.error
		);
	}
	const flags = options.descriptorFlags?.duplicate(source, duplicated.descriptor);
	if (!flags) {
		sourceOwner.close(duplicated.descriptor);
		return fail(context, options, operation, NATIVE_DESCRIPTOR_EBADF, "flag-state");
	}
	return finish(
		context,
		operation,
		source,
		duplicated.descriptor,
		false,
		targetOwner ? target : null
	);
}

function descriptorOwners(options) {
	return [
		options.readOnlyState,
		options.state,
		options.pipeState,
		options.epollState
	].filter((state, index, states) => state && states.indexOf(state) === index);
}

function findOwner(owners, descriptor) {
	return owners.find(state => state?.has?.(descriptor)) || null;
}

function finish(context, operation, source, descriptor, noOp, replaced) {
	return finishNativeDescriptor(context, descriptor, 32, {
		descriptor,
		noOp,
		operation,
		replaced,
		source
	});
}

function fail(context, options, operation, code, reason) {
	return failNativeDescriptor(context, options.errnoState, code, 32, {
		operation,
		reason
	});
}

function signedDescriptor(value) {
	return Number(BigInt.asIntN(32, BigInt(value)));
}
