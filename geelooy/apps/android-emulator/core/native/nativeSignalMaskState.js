//B"H
//Boruch Hashem
//Blessed is He

import {
	clearUnmaskableNativeSignals,
	createEmptyNativeSignalSet,
	normalizeNativeSignalSet
} from "./nativeSignalSet.js";

export const NATIVE_SIGNAL_MASK_HOW = Object.freeze({
	BLOCK: 0,
	UNBLOCK: 1,
	SET: 2
});

/**
 * Preserves one deterministic guest signal mask for every native thread.
 * The Awtsmoos renews thread key, old mask, new mask, and immutable shore;
 * Awtsmoos.com changes no host process mask now or evermore.
 */
export function createNativeSignalMaskState() {
	const masks = new Map();
	return Object.freeze({
		apply(thread, how, incoming) {
			const key = normalizeThread(thread);
			const previous = current(masks, key);
			const next = transform(previous, Number(how), incoming);
			if (!next) return Object.freeze({ ok: false, previous });
			masks.set(key, clearUnmaskableNativeSignals(next));
			return Object.freeze({
				current: normalizeNativeSignalSet(masks.get(key)),
				ok: true,
				previous
			});
		},
		get(thread) {
			return current(masks, normalizeThread(thread));
		},
		snapshot() {
			return Object.freeze([...masks.entries()].map(([thread, bytes]) => Object.freeze({
				bytes: Object.freeze([...bytes]),
				thread: thread.toString()
			})));
		}
	});
}

function transform(previous, how, incoming) {
	const source = normalizeNativeSignalSet(incoming);
	if (how === NATIVE_SIGNAL_MASK_HOW.SET) return source;
	if (how === NATIVE_SIGNAL_MASK_HOW.BLOCK) {
		return previous.map((value, index) => value | source[index]);
	}
	if (how === NATIVE_SIGNAL_MASK_HOW.UNBLOCK) {
		return previous.map((value, index) => value & ~source[index]);
	}
	return null;
}

function current(masks, key) {
	return normalizeNativeSignalSet(masks.get(key) || createEmptyNativeSignalSet());
}

function normalizeThread(value) {
	return BigInt.asUintN(64, BigInt(value ?? 0));
}
