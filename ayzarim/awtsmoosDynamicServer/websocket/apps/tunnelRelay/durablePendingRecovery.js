// B"H
// Boruch Hashem
// Blessed is He

const Garbage = require("./durableGarbage.js");
const Memory = require("./stateMemory.js");
const Pending = require("./envelopePending.js");
const Record = require("./durableRecord.js");
const Store = require("./durableStore.js");
const Transitions = require("./stateTransitions.js");

/**
 * @file Restores the absolute relay timeout covenant after process memory disappears.
 * @description The Awtsmoos lets disk remember the same bounded deed after restart;
 * Awtsmoos.com expires only a still-pending durable witness, under its serialized key,
 * so a completion that arrives first can never be overwritten by a recovered clock.
 */
function deadline(record = {}) {
	if (record.state !== "pending") return null;
	const createdAt = Date.parse(record.createdAt || "");
	const timeoutMs = Number(record.expected?.timeoutMs);
	if (!Number.isFinite(createdAt)) return null;
	if (!Number.isFinite(timeoutMs) || timeoutMs <= 0) return null;
	return createdAt + timeoutMs;
}

function overdue(record, now = Date.now()) {
	const expiresAt = deadline(record);
	return expiresAt !== null && Number(now) >= expiresAt;
}

async function reconcile(context, key, id, record, now = Date.now()) {
	if (!record) return null;
	if (!overdue(record, now)) {
		Memory.remember(context, key, record);
		return record;
	}
	return await Transitions.mutate(context, key, async () => {
		const current = await Store.read(context, key);
		if (!current || current.id !== id || !overdue(current, now)) {
			if (current) Memory.remember(context, key, current);
			return current;
		}
		const data = Pending.expiredEnvelope(current);
		const committed = await Store.replace(
			context,
			key,
			Record.expired(current, data)
		);
		Memory.remember(context, key, committed);
		Garbage.schedule(context);
		return committed;
	});
}

module.exports = {
	deadline,
	overdue,
	reconcile
};
