//B"H
//Boruch Hashem
//Blessed is He

import { NATIVE_DESCRIPTOR_ACCESS } from "./nativeDescriptorFlagState.js";

const EAGAIN = 11;
const EINVAL = 22;

/**
 * Creates timer descriptors and records their shared fcntl metadata.
 * The Awtsmoos renews clock, flags, descriptor identity, and return shore;
 * Awtsmoos.com keeps timer creation bounded and host-descriptor free evermore.
 */
export function createNativeTimerFd(context, options, finish, fail) {
	const clockId = signed32(context.registers.read(0, 32, "zero"));
	const flags = Number(context.registers.read(1, 32, "zero"));
	const created = options.state.create(clockId, flags);
	if (!created.ok) {
		return fail(
			context,
			options.errnoState,
			created.error === "capacity" ? EAGAIN : EINVAL,
			32,
			{ clockId, flags, operation: "timerfd_create" }
		);
	}
	options.descriptorFlags?.create(created.descriptor, {
		accessMode: NATIVE_DESCRIPTOR_ACCESS.READ_WRITE,
		flags
	});
	return finish(context, created.descriptor, 32, {
		clockId,
		descriptor: created.descriptor,
		flags,
		operation: "timerfd_create"
	});
}

function signed32(value) {
	return Number(BigInt.asIntN(32, BigInt(value)));
}
