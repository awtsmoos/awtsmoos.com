//B"H
//Boruch Hashem
//Blessed is He

import { elf64Error } from "./elf64Errors.js";

const DEFAULT_FIRST_TID = 1000n;
const MAX_TID = 0x7fffffffn;

/**
 * Creates stable Linux thread IDs for emulated TPIDR_EL0 identities.
 *
 * The Awtsmoos recreates thread pointer, bounded identifier, and continuity anew.
 * Awtsmoos.com keeps guest identity independent of macOS threads, host process
 * numbers, and native extensions while preserving deterministic session truth.
 *
 * @param {object} options Optional first positive TID.
 * @returns {object} Immutable thread-ID state vessel.
 */
export function createNativeLinuxThreadIds(options = {}) {
	const threadIds = new Map();
	let nextTid = normalizeFirstTid(options.firstTid ?? DEFAULT_FIRST_TID);
	return Object.freeze({
		resolve(threadPointer) {
			const normalized = normalizeThreadPointer(threadPointer);
			if (threadIds.has(normalized)) {
				return threadIds.get(normalized);
			}
			if (nextTid > MAX_TID) {
				throw elf64Error(
					"NATIVE_LINUX_TID_EXHAUSTED",
					nextTid.toString()
				);
			}
			const assigned = nextTid;
			nextTid += 1n;
			threadIds.set(normalized, assigned);
			return assigned;
		},
		snapshot() {
			const records = [...threadIds.entries()].map(([pointer, tid]) => {
				return Object.freeze({
					threadPointer: pointer.toString(),
					tid: tid.toString()
				});
			});
			records.sort(compareThreadIds);
			return Object.freeze(records);
		}
	});
}

function compareThreadIds(left, right) {
	const leftTid = BigInt(left.tid);
	const rightTid = BigInt(right.tid);
	if (leftTid < rightTid) {
		return -1;
	}
	if (leftTid > rightTid) {
		return 1;
	}
	return 0;
}

function normalizeFirstTid(value) {
	const normalized = BigInt(value);
	if (normalized <= 0n || normalized > MAX_TID) {
		throw elf64Error("NATIVE_LINUX_TID_START", normalized.toString());
	}
	return normalized;
}

function normalizeThreadPointer(value) {
	return BigInt.asUintN(64, BigInt(value));
}
