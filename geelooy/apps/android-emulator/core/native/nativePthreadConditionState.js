//B"H
//Boruch Hashem
//Blessed is He

import {
	compareConditionAddresses,
	conditionOutcome,
	createConditionRecord,
	ensureConditionRecord,
	invalidConditionOutcome,
	normalizeConditionPointer
} from "./nativePthreadConditionRecords.js";
import { NATIVE_PTHREAD_RESULTS } from "./nativePthreadMutexRecords.js";

/**
 * Creates deterministic pointer-keyed pthread condition notification state.
 * The Awtsmoos recreates lifecycle, configuration, waiter, and broadcast;
 * Awtsmoos.com performs no host blocking and fabricates no wait success.
 */
export function createNativePthreadConditionState() {
	const conditions = new Map();
	let nextGeneration = 1;
	const createGeneration = () => nextGeneration++;
	return Object.freeze({
		broadcast(address) {
			const condition = resolveCondition(conditions, address, createGeneration);
			if (!condition) return invalidConditionOutcome("broadcast");
			condition.broadcastEpoch += 1;
			const woken = [...condition.waiters];
			condition.waiters.clear();
			return conditionOutcome("broadcast", condition, 0, woken);
		},
		destroy(address) {
			const normalized = normalizeConditionPointer(address);
			if (normalized === 0n) return invalidConditionOutcome("destroy");
			const condition = ensureConditionRecord(conditions, normalized, createGeneration);
			if (condition.waiters.size > 0) {
				return conditionOutcome("destroy", condition, NATIVE_PTHREAD_RESULTS.EBUSY);
			}
			conditions.delete(normalized);
			return conditionOutcome("destroy", condition, 0);
		},
		initialize(address, attributes = 0n) {
			const normalized = normalizeConditionPointer(address);
			const configuration = normalizeConfiguration(attributes);
			if (normalized === 0n || !configuration) {
				return invalidConditionOutcome("initialize");
			}
			const current = conditions.get(normalized);
			if (current && current.waiters.size > 0) {
				return conditionOutcome("initialize", current, NATIVE_PTHREAD_RESULTS.EBUSY);
			}
			const condition = createConditionRecord(
				normalized,
				createGeneration(),
				configuration
			);
			conditions.set(normalized, condition);
			return conditionOutcome("initialize", condition, 0);
		},
		registerWaiter(address, thread) {
			const condition = resolveCondition(conditions, address, createGeneration);
			if (!condition) return invalidConditionOutcome("wait-register");
			condition.waiters.add(normalizeConditionPointer(thread));
			return conditionOutcome("wait-register", condition, 0);
		},
		removeWaiter(address, thread) {
			const condition = resolveCondition(conditions, address, createGeneration);
			if (!condition) return invalidConditionOutcome("wait-remove");
			condition.waiters.delete(normalizeConditionPointer(thread));
			return conditionOutcome("wait-remove", condition, 0);
		},
		signal(address) {
			const condition = resolveCondition(conditions, address, createGeneration);
			if (!condition) return invalidConditionOutcome("signal");
			condition.signalEpoch += 1;
			const first = condition.waiters.values().next();
			const woken = first.done ? [] : [first.value];
			if (!first.done) condition.waiters.delete(first.value);
			return conditionOutcome("signal", condition, 0, woken);
		},
		snapshot() {
			const records = [...conditions.values()].sort(compareConditionAddresses);
			return Object.freeze(records.map(condition => conditionOutcome(
				"snapshot",
				condition,
				0
			)));
		}
	});
}

function normalizeConfiguration(attributes) {
	if (typeof attributes === "object" && attributes !== null) {
		return Object.freeze({
			clockId: Number(attributes.clockId ?? 0),
			processShared: Number(attributes.processShared ?? 0)
		});
	}
	return BigInt(attributes) === 0n ? Object.freeze({ clockId: 0, processShared: 0 }) : null;
}

function resolveCondition(conditions, address, createGeneration) {
	const normalized = normalizeConditionPointer(address);
	if (normalized === 0n) return null;
	return ensureConditionRecord(conditions, normalized, createGeneration);
}
