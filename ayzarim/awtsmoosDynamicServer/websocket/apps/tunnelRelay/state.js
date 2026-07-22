// B"H
// Boruch Hashem
// Blessed is He

const Garbage = require("./durableGarbage.js");
const Memory = require("./stateMemory.js");
const Record = require("./durableRecord.js");
const Store = require("./durableStore.js");

/**
 * @file Joins in-memory relay speed to durable restart authority.
 * @description
 * The Awtsmoos keeps one deed known before and after process memory disappears.
 * Awtsmoos.com namespaces claims by authorized registration, hydrates them once,
 * and exposes completion only after atomic terminal readback has been verified.
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
	return {
		...result,
		key
	};
}

async function rememberCompleted(context, id, data, expected = {}) {
	const state = data?.ok === false ? "failed" : "completed";
	return await rememberTerminal(context, id, data, expected, state);
}

async function rememberExpired(context, id, data, expected = {}) {
	return await rememberTerminal(context, id, data, expected, "expired");
}

async function rememberTerminal(context, id, data, expected, state) {
	const key = durableKey(id, expected);
	const current = await Store.read(context, key) || Record.pending(key, id, expected);
	const next = state === "expired"
		? Record.expired(current, data)
		: state === "failed"
			? Record.failed(current, data)
			: Record.completed(current, data);
	const committed = await Store.replace(context, key, next);
	Memory.remember(context, key, committed);
	Garbage.schedule(context);
	return committed;
}

function observed(context, id, expected = {}) {
	return Memory.observed(context, durableKey(id, expected));
}

function completed(context, id, expected = {}) {
	return Memory.completed(context, durableKey(id, expected));
}

function expired(context, id, expected = {}) {
	return Memory.expired(context, durableKey(id, expected));
}

module.exports = {
	claim,
	cleanup: Memory.cleanup,
	completed,
	durableKey,
	ensureStores: Memory.ensureStores,
	expired,
	hydrate,
	observed,
	quarantine: Memory.quarantine,
	rememberCompleted,
	rememberExpired,
	rememberTerminal,
	snapshot: Memory.snapshot
};
