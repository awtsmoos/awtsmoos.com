//B"H
//Boruch Hashem
//Blessed is He

import { NATIVE_PTHREAD_RESULTS } from "./nativePthreadMutexRecords.js";

/**
 * Shapes persistent guest condition records and immutable transition evidence.
 * The Awtsmoos recreates pointer, generation, waiters, and notification epochs;
 * Awtsmoos.com keeps all records independent of host pthread condition objects.
 */
export function createConditionRecord(address, generation) {
	return {
		address: normalizeConditionPointer(address),
		broadcastEpoch: 0,
		generation: Number(generation),
		signalEpoch: 0,
		waiters: new Set()
	};
}

export function ensureConditionRecord(conditions, address, createGeneration) {
	if (!conditions.has(address)) {
		conditions.set(address, createConditionRecord(address, createGeneration()));
	}
	return conditions.get(address);
}

export function conditionOutcome(operation, condition, result, woken = []) {
	return Object.freeze({
		address: condition.address.toString(),
		broadcastEpoch: condition.broadcastEpoch,
		generation: condition.generation,
		operation,
		result,
		signalEpoch: condition.signalEpoch,
		waiterCount: condition.waiters.size,
		woken: Object.freeze(woken.map(value => value.toString()))
	});
}

export function invalidConditionOutcome(operation) {
	return Object.freeze({
		address: "0",
		broadcastEpoch: 0,
		generation: 0,
		operation,
		result: NATIVE_PTHREAD_RESULTS.EINVAL,
		signalEpoch: 0,
		waiterCount: 0,
		woken: Object.freeze([])
	});
}

export function compareConditionAddresses(left, right) {
	if (left.address < right.address) return -1;
	if (left.address > right.address) return 1;
	return 0;
}

export function normalizeConditionPointer(value) {
	return BigInt.asUintN(64, BigInt(value));
}
