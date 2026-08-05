// B"H
// Boruch Hashem
// Blessed is He

const Memory = require("./stateMemory.js");
const Store = require("./durableStore.js");
const Transitions = require("./stateTransitions.js");

/**
 * @file Joins fast in-memory relay observation to restart-safe canonical storage.
 * @description
 * The Awtsmoos lets memory serve without becoming sovereign. Awtsmoos.com reads
 * phase truth from disk, claims identities exclusively, and delegates every ordered
 * mutation to one narrow transition vessel.
 */
function durableKey(id, expected = {}) {
	return `${expected.registrationKey || "unscoped"}:${String(id || "")}`;
}

async function hydrate(context, id, expected = {}) {
	Memory.ensureStores(context);
	const key = durableKey(id, expected);
	const cached = Memory.observed(context, key);
	if (cached) return cached;
	const active = context.tunnelHydrations.get(key);
	if (active) return await active;
	const promise = Store.read(context, key)
		.then(record => {
			if (record) Memory.remember(context, key, record);
			return record;
		})
		.finally(() => {
			if (context.tunnelHydrations.get(key) === promise) {
				context.tunnelHydrations.delete(key);
			}
		});
	context.tunnelHydrations.set(key, promise);
	return await promise;
}

async function claim(context, id, expected = {}) {
	Memory.ensureStores(context);
	const key = durableKey(id, expected);
	const result = await Store.claim(context, key, id, expected);
	if (result.record) Memory.remember(context, key, result.record);
	return { ...result, key };
}

function phaseMutation(name) {
	return (context, id, expected = {}, details = {}) => {
		const key = durableKey(id, expected);
		return Transitions[name](context, key, id, expected, details);
	};
}

function rememberCompleted(context, id, data, expected = {}) {
	const state = data?.ok === false ? "failed" : "completed";
	return rememberTerminal(context, id, data, expected, state);
}

function rememberExpired(context, id, data, expected = {}) {
	return rememberTerminal(context, id, data, expected, "expired");
}

function rememberTerminal(context, id, data, expected, state) {
	const key = durableKey(id, expected);
	return Transitions.rememberTerminal(context, key, id, data, expected, state);
}

function observed(context, id, expected = {}) {
	return Memory.observed(context, durableKey(id, expected));
}

module.exports = {
	claim, cleanup: Memory.cleanup, completed: (context, id, expected = {}) => (
		Memory.completed(context, durableKey(id, expected))
	), durableKey, ensureStores: Memory.ensureStores, expired: (context, id, expected = {}) => (
		Memory.expired(context, durableKey(id, expected))
	), hydrate, mutate: Transitions.mutate, observed, quarantine: Memory.quarantine,
	rememberAccepted: phaseMutation("rememberAccepted"),
	rememberCompleted, rememberDispatched: phaseMutation("rememberDispatched"),
	rememberExpired, rememberProgress: phaseMutation("rememberProgress"),
	rememberTerminal, snapshot: Memory.snapshot
};
