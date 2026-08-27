//B"H
//Boruch Hashem
//Blessed is He

import { elf64Error } from "./elf64Errors.js";

/**
 * Creates exact-once records and nested per-thread guest initializer frames.
 * The Awtsmoos recreates control, owner, return road, and completion every time;
 * Awtsmoos.com never invokes a host function pointer or guesses opaque bits.
 */
export function createNativePthreadOnceState() {
	const records = new Map();
	const stacks = new Map();
	return Object.freeze({
		begin(detail) {
			const frame = normalizeFrame(detail);
			const record = records.get(frame.control);
			if (record?.status === "complete") {
				return result(record, "already-complete", null);
			}
			if (record?.status === "running") {
				const code = record.owner === frame.thread
					? "NATIVE_PTHREAD_ONCE_REENTRANT"
					: "NATIVE_PTHREAD_ONCE_BUSY";
				throw elf64Error(code, `${frame.control}:${record.owner}`);
			}
			const next = {
				control: frame.control,
				initializer: frame.initializer,
				owner: frame.thread,
				runs: record?.runs || 0,
				status: "running"
			};
			records.set(frame.control, next);
			const stack = stacks.get(frame.thread) || [];
			stack.push(frame);
			stacks.set(frame.thread, stack);
			return result(next, "started", frame);
		},
		complete(threadValue) {
			const thread = normalize(threadValue);
			const stack = stacks.get(thread);
			if (!stack?.length) {
				throw elf64Error("NATIVE_PTHREAD_ONCE_FRAME_MISSING", thread);
			}
			const frame = stack.pop();
			if (!stack.length) stacks.delete(thread);
			const record = records.get(frame.control);
			if (!record || record.status !== "running" || record.owner !== thread) {
				throw elf64Error("NATIVE_PTHREAD_ONCE_FRAME_INVALID", frame.control);
			}
			record.status = "complete";
			record.runs += 1;
			return result(record, "completed", frame);
		},
		snapshot() {
			return Object.freeze([...records.values()]
				.sort((left, right) => left.control < right.control ? -1 : 1)
				.map(record => Object.freeze({
					control: record.control.toString(),
					initializer: record.initializer.toString(),
					owner: record.owner.toString(),
					runs: record.runs,
					status: record.status
				})));
		}
	});
}

function normalizeFrame(detail) {
	const frame = Object.freeze({
		control: normalize(detail.control),
		initializer: normalize(detail.initializer),
		originalReturn: normalize(detail.originalReturn),
		thread: normalize(detail.thread),
		trampoline: normalize(detail.trampoline)
	});
	for (const [name, value] of Object.entries(frame)) {
		if (value === 0n) throw elf64Error("NATIVE_PTHREAD_ONCE_ARGUMENT", name);
	}
	return frame;
}

function normalize(value) {
	return BigInt.asUintN(64, BigInt(value));
}

function result(record, status, frame) {
	return Object.freeze({
		control: record.control,
		frame,
		initializer: record.initializer,
		runs: record.runs,
		status
	});
}
