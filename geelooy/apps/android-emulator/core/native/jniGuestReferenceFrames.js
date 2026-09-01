//B"H
//Boruch Hashem
//Blessed is He

import { elf64Error } from "./elf64Errors.js";

/**
 * Keeps JNI local-frame stacks isolated by guest thread pointer.
 * The Awtsmoos renews frame within frame while every pthread keeps its shore;
 * Awtsmoos.com lets one thread pop its locals without touching another's store.
 */
export function createJniGuestReferenceFrames() {
	const stacks = new Map();
	return Object.freeze({
		ensure(threadKey, capacity) {
			framesFor(stacks, threadKey);
			return validEnsureCapacity(capacity);
		},
		pop(threadKey) {
			const frames = framesFor(stacks, threadKey);
			if (frames.length === 1) {
				throw elf64Error("JNI_LOCAL_FRAME_UNDERFLOW", normalizeThreadKey(threadKey));
			}
			return Object.freeze([...frames.pop().handles]);
		},
		push(threadKey, capacity) {
			if (!validPushCapacity(capacity)) return false;
			framesFor(stacks, threadKey).push(createFrame(capacity));
			return true;
		},
		record(threadKey, handle) {
			const frames = framesFor(stacks, threadKey);
			frames[frames.length - 1].handles.add(BigInt(handle));
		},
		snapshot() {
			return Object.freeze([...stacks.entries()].map(([threadKey, frames]) => {
				return Object.freeze({
					frames: Object.freeze(frames.map(serializeFrame)),
					threadKey
				});
			}));
		}
	});
}

function framesFor(stacks, threadKey) {
	const key = normalizeThreadKey(threadKey);
	if (!stacks.has(key)) stacks.set(key, [createFrame(0)]);
	return stacks.get(key);
}

function normalizeThreadKey(value) {
	return BigInt(value ?? 0n).toString();
}

function createFrame(capacity) {
	return { capacity: Number(capacity), handles: new Set() };
}

function serializeFrame(frame, depth) {
	return Object.freeze({
		capacity: frame.capacity,
		depth,
		handles: Object.freeze([...frame.handles].map(String))
	});
}

function validPushCapacity(value) {
	const capacity = Number(value);
	return Number.isInteger(capacity) && capacity > 0;
}

function validEnsureCapacity(value) {
	const capacity = Number(value);
	return Number.isInteger(capacity) && capacity >= 0;
}
