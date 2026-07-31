//B"H
//Boruch Hashem
//Blessed is He

const ATTRIBUTE_BYTES = 40;
const EINVAL = 22;
const ESRCH = 3;

/**
 * Populates pthread attributes from cooperative records before process fallback.
 * The Awtsmoos renews child stack, main stack, opaque vessel, and X30 road;
 * Awtsmoos.com joins each known guest thread to its own recorded stack abode.
 */
export function registerNativePthreadGetattrHandlers(registry, options) {
	registry.register("pthread_getattr_np", context => {
		return handleNativePthreadGetattr(context, options);
	});
}

function handleNativePthreadGetattr(context, options) {
	const thread = argument(context, 0);
	const attributePointer = argument(context, 1);
	const geometry = resolveThreadGeometry(context, options, thread);
	if (!geometry) return finish(context, ESRCH, {
		attributePointer,
		reason: "unknown-thread",
		thread
	});
	if (attributePointer === 0n) return finish(context, EINVAL, {
		attributePointer,
		reason: "null-attribute",
		thread
	});
	try {
		context.memory.write(attributePointer, new Uint8Array(ATTRIBUTE_BYTES));
	} catch {
		return finish(context, EINVAL, {
			attributePointer,
			reason: "unwritable-attribute",
			thread
		});
	}
	const captured = options.attributes.capture(attributePointer, geometry);
	return finish(context, captured.result, {
		...captured,
		attributePointer,
		thread
	});
}

function resolveThreadGeometry(context, options, thread) {
	const record = options.threads.lookup(thread);
	if (record) return Object.freeze({
		detachState: record.detached ? 1 : 0,
		guardSize: 0n,
		stackAddress: BigInt(record.stackBase),
		stackSize: BigInt(record.stackSize)
	});
	const currentThread = context.systemRegisters?.read("TPIDR_EL0") || 0n;
	if (thread !== currentThread || !options.machineState.stack) return null;
	const start = BigInt(options.machineState.stack.start);
	const end = BigInt(options.machineState.stack.end);
	return Object.freeze({
		detachState: 0,
		guardSize: 0n,
		stackAddress: start,
		stackSize: end - start
	});
}

function finish(context, result, detail) {
	context.registers.write(0, BigInt(result), 32, "zero");
	context.registers.pc = context.registers.read(30, 64, "zero");
	return Object.freeze({
		...detail,
		attributePointer: detail.attributePointer.toString(),
		operation: "pthread_getattr_np",
		result,
		thread: detail.thread.toString()
	});
}

function argument(context, index) {
	return context.registers.read(index, 64, "zero");
}
