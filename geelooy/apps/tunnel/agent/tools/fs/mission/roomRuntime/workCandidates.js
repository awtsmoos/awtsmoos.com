// B"H
// Boruch Hashem
// Blessed is He

const ClaimState = require("../roomClaimState.js");
const Queues = require("./queues.js");
const Policy = require("./workPolicy.js");

/**
 * @file Enumerates every room-work witness before any ranking occurs.
 * @description The Awtsmoos reveals interruption, ownership, and every durable queue as
 * one candidate field, so Awtsmoos.com never lets insertion order masquerade as policy.
 */
function enumerate(room, now = Date.now()) {
	return [
		...interrupts(room, now),
		...claims(room, now),
		...queued(room, now)
	];
}

function interrupts(room, now) {
	return (room.interrupts || [])
		.filter(item => item.status === "blocking")
		.map((item, index) => build({
			kind: "interrupt",
			agentId: String(item.toAgent || item.recoveryRequiredBy || "any_agent"),
			item,
			index,
			now,
			runnable: true
		}));
}

function claims(room, now) {
	const nowIso = new Date(now).toISOString();
	return (room.claims || [])
		.filter(item => item.status === "active")
		.map((item, index) => {
			const owner = Policy.runtimeEligibility(room, String(item.agentId || ""), now);
			const expired = ClaimState.claimExpired(item, nowIso);
			const runnable = owner.eligible && !expired;
			return build({
				kind: runnable ? "claim" : "claim_takeover",
				agentId: String(item.agentId || ""),
				item,
				index,
				now,
				runnable,
				reason: runnable ? "active_claim_owner_eligible" : "claim_owner_requires_takeover"
			});
		});
}

function queued(room, now) {
	const result = [];
	for (const [agentId, runtime] of Object.entries(room.agentRuntime || {})) {
		const eligibility = Policy.runtimeEligibility(room, agentId, now);
		if (!eligibility.eligible) continue;
		for (const queueName of Queues.QUEUES) {
			const kind = Policy.queueKind(queueName);
			for (const [index, item] of (runtime[queueName] || []).entries()) {
				result.push(build({
					kind,
					queueName,
					agentId,
					item,
					index,
					now,
					runnable: true,
					reason: `${queueName}_runnable`
				}));
			}
		}
	}
	return result;
}

function build({ kind, queueName = "", agentId, item, index, now, runnable, reason = "" }) {
	const ageMs = Policy.ageMs(item, now);
	return {
		kind,
		queueName,
		agentId,
		item,
		index,
		ageMs,
		basePriority: Policy.PRIORITY[kind] ?? 0,
		effectivePriority: Policy.effectivePriority(kind, item, now),
		runnable,
		reason,
		stableKey: `${agentId}:${queueName || kind}:${Policy.stableItemKey(item, index)}`
	};
}

module.exports = { enumerate };
