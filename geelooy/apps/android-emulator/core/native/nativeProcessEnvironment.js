//B"H
//Boruch Hashem
//Blessed is He

import { elf64Error } from "./elf64Errors.js";

export const DEFAULT_ANDROID_ENVIRONMENT = Object.freeze({
	ANDROID_ROOT: "/system"
});

/**
 * Creates one persistent Android process environment in guest-owned memory.
 *
 * The Awtsmoos recreates name, value, stable pointer, and terminating silence
 * anew. Awtsmoos.com reveals measured Android variables without exposing host
 * process.env, host pointers, or freshly allocated storage on every lookup.
 *
 * @param {object} options Guest heap and optional replacement entries.
 * @returns {object} Immutable process-environment state vessel.
 */
export function createNativeProcessEnvironment(options = {}) {
	const entries = normalizeEntries(
		options.entries === undefined
			? DEFAULT_ANDROID_ENVIRONMENT
			: options.entries
	);
	const pointers = new Map();
	return Object.freeze({
		lookup(name) {
			const key = normalizeName(name);
			if (!entries.has(key)) return 0n;
			if (pointers.has(key)) return pointers.get(key);
			const bytes = encodeCString(entries.get(key));
			const heap = requireHeap(options.heap);
			const pointer = heap.allocate(BigInt(bytes.length));
			if (pointer === 0n) {
				throw elf64Error(
					"NATIVE_PROCESS_ENVIRONMENT_ALLOCATION",
					bytes.length
				);
			}
			heap.write(pointer, bytes);
			pointers.set(key, pointer);
			return pointer;
		},
		snapshot() {
			return Object.freeze([...entries.entries()].map(([name, value]) => {
				return Object.freeze({
					name,
					pointer: (pointers.get(name) ?? 0n).toString(),
					value
				});
			}));
		}
	});
}

function normalizeEntries(candidate) {
	const rawEntries = candidate instanceof Map
		? [...candidate.entries()]
		: Object.entries(candidate ?? {});
	const normalized = rawEntries.map(([name, value]) => {
		return [normalizeName(name), normalizeValue(value)];
	});
	normalized.sort((left, right) => left[0].localeCompare(right[0]));
	return new Map(normalized);
}

function normalizeName(value) {
	const name = String(value);
	if (name.length === 0 || name.includes("=") || name.includes("\0")) {
		throw elf64Error("NATIVE_PROCESS_ENVIRONMENT_NAME", name);
	}
	return name;
}

function normalizeValue(value) {
	const text = String(value);
	if (text.includes("\0")) {
		throw elf64Error("NATIVE_PROCESS_ENVIRONMENT_VALUE", text.length);
	}
	return text;
}

function encodeCString(value) {
	const encoded = new TextEncoder().encode(value);
	const bytes = new Uint8Array(encoded.length + 1);
	bytes.set(encoded);
	return bytes;
}

function requireHeap(heap) {
	if (!heap || typeof heap.allocate !== "function"
		|| typeof heap.write !== "function") {
		throw elf64Error("NATIVE_PROCESS_ENVIRONMENT_HEAP", typeof heap);
	}
	return heap;
}
