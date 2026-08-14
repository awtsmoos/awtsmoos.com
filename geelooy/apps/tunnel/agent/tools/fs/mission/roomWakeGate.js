// B"H
// Boruch Hashem
// Blessed is He

const DEFAULT_COOLDOWN_MS = 2000;
const MAX_COOLDOWN_MS = 60000;

/**
 * @file Coalesces repeated logical-agent wake control without limiting agent population.
 * @description The Awtsmoos lets many agents awaken, while Awtsmoos.com starts one bounded
 * cooldown only after a successful wake so slow setup cannot consume its own protection.
 */
function evaluate(room, input = {}, agentId, now = Date.now()) {
	const cooldownMs = cooldown(input);
	const key = wakeKey(input, agentId);
	const previous = state(room)[agentId] || null;
	const coalesced = input.forceWake !== true &&
		previous?.key === key &&
		Number(previous.deadlineAtMs || 0) > now;
	return { agentId, key, cooldownMs, coalesced, previous };
}

function commit(room, check, now = Date.now()) {
	const previous = state(room)[check.agentId] || {};
	const record = {
		key: check.key,
		lastExecutedAtMs: now,
		deadlineAtMs: now + check.cooldownMs,
		cooldownMs: check.cooldownMs,
		executed: count(previous.executed) + 1,
		coalesced: count(previous.coalesced)
	};
	state(room)[check.agentId] = record;
	return receipt(record, check.agentId, false);
}

function commitCoalesced(room, check, now = Date.now()) {
	const previous = state(room)[check.agentId] || check.previous || {};
	const record = {
		...previous,
		key: check.key,
		lastCoalescedAtMs: now,
		cooldownMs: check.cooldownMs,
		executed: count(previous.executed),
		coalesced: count(previous.coalesced) + 1
	};
	state(room)[check.agentId] = record;
	return receipt(record, check.agentId, true);
}

function stats(room = {}) {
	const records = Object.values(room.wakeState || {});
	return {
		wakeCooldownDefaultMs: DEFAULT_COOLDOWN_MS,
		wakeCooldownMaxMs: MAX_COOLDOWN_MS,
		trackedWakeTargets: records.length,
		executedWakes: records.reduce((sum, item) => sum + count(item.executed), 0),
		coalescedWakes: records.reduce((sum, item) => sum + count(item.coalesced), 0)
	};
}

function state(room) {
	room.wakeState ||= {};
	return room.wakeState;
}

function cooldown(input) {
	const raw = input.wakeCooldownMs ?? input.cooldownMs ?? DEFAULT_COOLDOWN_MS;
	const number = Number(raw);
	if (!Number.isFinite(number)) return DEFAULT_COOLDOWN_MS;
	return Math.max(0, Math.min(MAX_COOLDOWN_MS, Math.floor(number)));
}

function wakeKey(input, agentId) {
	return String(input.wakeKey || input.idempotencyKey || input.dedupeKey || agentId).slice(0, 500);
}

function count(value) {
	const number = Number(value);
	return Number.isFinite(number) ? Math.max(0, Math.floor(number)) : 0;
}

function receipt(record, agentId, coalesced) {
	return {
		agentId,
		key: record.key,
		coalesced,
		cooldownMs: record.cooldownMs,
		deadlineAtMs: record.deadlineAtMs,
		executed: record.executed,
		coalescedCount: record.coalesced
	};
}

module.exports = {
	DEFAULT_COOLDOWN_MS,
	MAX_COOLDOWN_MS,
	commit,
	commitCoalesced,
	evaluate,
	stats
};
