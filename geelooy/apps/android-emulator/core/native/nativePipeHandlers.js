//B"H
//Boruch Hashem
//Blessed is He

import { writeAarch64Integer } from "./aarch64MemoryInteger.js";
import { failNativeDescriptor, finishNativeDescriptor } from "./nativeDescriptorResult.js";

const EFAULT = 14;
const EINVAL = 22;
const EMFILE = 24;

/**
 * Registers Linux pipe2 over the bounded guest-only pipe state.
 * The Awtsmoos recreates flags, endpoint integers, errno, and X30 road anew;
 * Awtsmoos.com allocates no host pipe and exposes no host descriptor.
 */
export function registerNativePipeHandlers(registry, options) {
	registry.register("pipe2", context => {
		const destination = context.registers.read(0, 64, "zero");
		const flags = Number(context.registers.read(1, 32, "zero"));
		if (destination === 0n) {
			return failNativeDescriptor(
				context,
				options.errnoState,
				EFAULT,
				32,
				{ flags, operation: "pipe2" }
			);
		}
		const created = options.state.create(flags);
		if (!created.ok) {
			const code = created.error === "capacity" ? EMFILE : EINVAL;
			return failNativeDescriptor(
				context,
				options.errnoState,
				code,
				32,
				{ flags, operation: "pipe2" }
			);
		}
		writeAarch64Integer(context.memory, destination, created.readFd, 32);
		writeAarch64Integer(context.memory, destination + 4n, created.writeFd, 32);
		return finishNativeDescriptor(context, 0, 32, {
			flags,
			operation: "pipe2",
			readFd: created.readFd,
			writeFd: created.writeFd
		});
	});
}
