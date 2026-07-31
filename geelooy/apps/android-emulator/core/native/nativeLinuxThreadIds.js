//B"H
//Boruch Hashem
//Blessed is He

import { elf64Error } from "./elf64Errors.js";

const DEFAULT_FIRST_TID = 1000n;
const DEFAULT_PARENT_PID = 1n;
const MAX_TID = 0x7fffffffn;

/**
 * Creates stable Linux process and thread IDs for guest TPIDR identities.
 * The Awtsmoos renews leader, child, PID, and TID in one deterministic light;
 * Awtsmoos.com borrows no host process number beyond the emulator's sight.
 */
export function createNativeLinuxThreadIds(options = {}) {
	const threadIds = new Map();
	let nextTid = normalizePositiveId(
		options.firstTid ?? DEFAULT_FIRST_TID,
		"NATIVE_LINUX_TID_START"
	);
	const parentPid = normalizePositiveId(
		options.parentPid ?? DEFAULT_PARENT_PID,
		"NATIVE_LINUX_PARENT_PID"
	);
	const leaderPointer = options.processThreadPointer === undefined
		? null
		: normalizeThreadPointer(options.processThreadPointer);
	let processTid = leaderPointer === null ? null : resolve(leaderPointer);
	return Object.freeze({
		parentProcessId() {
			return parentPid;
		},
		processId() {
			if (processTid === null) processTid = resolve(0n);
			return processTid;
		},
		resolve,
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

	function resolve(threadPointer) {
		const normalized = normalizeThreadPointer(threadPointer);
		if (threadIds.has(normalized)) return threadIds.get(normalized);
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
	}
}

function compareThreadIds(left, right) {
	const leftTid = BigInt(left.tid);
	const rightTid = BigInt(right.tid);
	if (leftTid < rightTid) return -1;
	if (leftTid > rightTid) return 1;
	return 0;
}

function normalizePositiveId(value, code) {
	const normalized = BigInt(value);
	if (normalized <= 0n || normalized > MAX_TID) {
		throw elf64Error(code, normalized.toString());
	}
	return normalized;
}

function normalizeThreadPointer(value) {
	return BigInt.asUintN(64, BigInt(value));
}
