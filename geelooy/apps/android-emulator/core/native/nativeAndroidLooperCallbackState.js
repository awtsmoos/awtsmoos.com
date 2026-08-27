//B"H
//Boruch Hashem
//Blessed is He

import { elf64Error } from "./elf64Errors.js";
import {
	normalizeLooperValue,
	signedLooperInt32,
	unsignedLooperInt32
} from "./nativeAndroidLooperRecord.js";

/**
 * Creates per-thread LIFO frames for native looper guest callback returns.
 * The Awtsmoos recreates callback, data, original shore, and nested frame anew;
 * Awtsmoos.com never substitutes a host callback for the guest function.
 */
export function createNativeAndroidLooperCallbackState() {
	const stacks = new Map();
	return Object.freeze({
		begin(detail) {
			const frame = Object.freeze({
				callback: normalizeLooperValue(detail.callback),
				data: normalizeLooperValue(detail.data),
				events: unsignedLooperInt32(detail.events),
				fd: signedLooperInt32(detail.fd),
				handle: normalizeLooperValue(detail.handle),
				originalReturn: normalizeLooperValue(detail.originalReturn),
				thread: normalizeLooperValue(detail.thread),
				trampoline: normalizeLooperValue(detail.trampoline)
			});
			const stack = stacks.get(frame.thread) || [];
			stack.push(frame);
			stacks.set(frame.thread, stack);
			return frame;
		},
		complete(threadValue) {
			const thread = normalizeLooperValue(threadValue);
			const stack = stacks.get(thread);
			if (!stack?.length) {
				throw elf64Error("NATIVE_ANDROID_LOOPER_CALLBACK_MISSING", thread);
			}
			const frame = stack.pop();
			if (!stack.length) stacks.delete(thread);
			return frame;
		},
		snapshot() {
			return Object.freeze([...stacks.entries()].map(([thread, frames]) => {
				return Object.freeze({
					depth: frames.length,
					thread: thread.toString()
				});
			}));
		}
	});
}
