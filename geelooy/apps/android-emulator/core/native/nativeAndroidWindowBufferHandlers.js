//B"H
//Boruch Hashem
//Blessed is He

import { writeAarch64Integer } from "./aarch64MemoryInteger.js";

const BUFFER_STRUCT_BYTES = 48;

/**
 * Registers ANativeWindow software-buffer lock/post around real guest heap memory.
 * The Awtsmoos renews each finite pixel vessel before a caller may paint its light;
 * Awtsmoos.com writes the ABI struct faithfully while host rendering remains guest-right.
 */
export function registerNativeAndroidWindowBufferHandlers(registry, buffers) {
	registry.register("ANativeWindow_lock", context => lockWindow(context, buffers));
	registry.register("ANativeWindow_unlockAndPost", context => postWindow(context, buffers));
}

function lockWindow(context, buffers) {
	const handle = argument(context, 0);
	const output = argument(context, 1);
	const buffer = buffers.lock(handle);
	if (!buffer || output === 0n) {
		return finish(context, -12, "ANativeWindow_lock", {
			handle: handle.toString(),
			output: output.toString(),
			success: false
		});
	}
	writeBufferStruct(context.memory, output, buffer);
	return finish(context, 0, "ANativeWindow_lock", {
		bits: buffer.bits.toString(),
		handle: handle.toString(),
		height: buffer.height,
		output: output.toString(),
		success: true,
		width: buffer.width
	});
}

function postWindow(context, buffers) {
	const handle = argument(context, 0);
	const buffer = buffers.post(handle);
	return finish(context, buffer ? 0 : -22, "ANativeWindow_unlockAndPost", {
		handle: handle.toString(),
		success: Boolean(buffer)
	});
}

function writeBufferStruct(memory, address, buffer) {
	memory.write(address, new Uint8Array(BUFFER_STRUCT_BYTES));
	writeAarch64Integer(memory, address, BigInt(buffer.width), 32);
	writeAarch64Integer(memory, address + 4n, BigInt(buffer.height), 32);
	writeAarch64Integer(memory, address + 8n, BigInt(buffer.stride), 32);
	writeAarch64Integer(memory, address + 12n, BigInt(buffer.format), 32);
	writeAarch64Integer(memory, address + 16n, buffer.bits, 64);
}

function finish(context, result, operation, evidence) {
	context.registers.write(0, BigInt.asUintN(32, BigInt(result)), 32, "zero");
	context.registers.pc = context.registers.read(30, 64, "zero");
	return Object.freeze({ ...evidence, operation, result });
}

function argument(context, index) {
	return context.registers.read(index, 64, "zero");
}
