// B"H
// Boruch Hashem
// Blessed is He

const Garbage = require("./durableGarbage.js");
const Memory = require("./stateMemory.js");
const Record = require("./durableRecord.js");
const Store = require("./durableStore.js");

/**
 * @file Serializes each durable relay mutation, including late reconciliation.
 * @description
 * The Awtsmoos joins asynchronous witnesses into one ordered scroll. Awtsmoos.com
 * protects terminal truth from nonterminal overwrite, yet lets a later verified
 * device result be attached beside a prior transport failure without erasing it.
 */
function mutate(context, key, operation) {
	Memory.ensureStores(context);
	const previous = context.tunnelDurableMutations.get(key) || Promise.resolve();
	const current = previous
		.catch(() => {})
		.then(operation)
		.finally(() => {
			if (context.tunnelDurableMutations.get(key) === current) {
				context.tunnelDurableMutations.delete(key);
			}
		});
	context.tunnelDurableMutations.set(key, current);
	return current;
}

function rememberPhase(context, key, id, expected, transform) {
	return mutate(context, key, async () => {
		const current = await Store.read(context, key) || Record.pending(key, id, expected);
		const committed = Record.terminalState(current)
			? current
			: await Store.replace(context, key, transform(current));
		Memory.remember(context, key, committed);
		return committed;
	});
}

function rememberDispatched(context, key, id, expected, details) {
	return rememberPhase(
		context,
		key,
		id,
		expected,
		record => Record.dispatched(record, details)
	);
}

function rememberAccepted(context, key, id, expected, details) {
	return rememberPhase(
		context,
		key,
		id,
		expected,
		record => Record.accepted(record, details)
	);
}

function rememberProgress(context, key, id, expected, details) {
	return rememberPhase(
		context,
		key,
		id,
		expected,
		record => Record.progressed(record, details)
	);
}

function rememberTerminal(context, key, id, data, expected, state) {
	return mutate(context, key, async () => {
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
	});
}

/** Appends verified late terminal evidence without replacing the original terminal data. */
function rememberReconciliation(context, key, id, data, expected, details = {}) {
	return mutate(context, key, async () => {
		const current = await Store.read(context, key);
		if (!current || current.id !== id || !Record.terminalState(current)) {
			return current;
		}
		const committed = await Store.replace(
			context,
			key,
			Record.reconciled(current, data, details)
		);
		Memory.remember(context, key, committed);
		Garbage.schedule(context);
		return committed;
	});
}

module.exports = {
	mutate,
	rememberAccepted,
	rememberDispatched,
	rememberProgress,
	rememberReconciliation,
	rememberTerminal
};
