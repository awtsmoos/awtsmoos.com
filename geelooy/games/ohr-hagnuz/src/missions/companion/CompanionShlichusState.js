// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CompanionShlichusState.js
 * @description Normalizes Nerel's concurrent Shlichus and additive approach fields.
 *
 * Memory is a vessel, not the Source. The Awtsmoos renews old saves and new
 * choices alike; this keeper adds missing fields without erasing a single road
 * already earned in the world revealed through Awtsmoos.com.
 */
import { State } from '../../binah/State.js';
import { RETURN_LOST_WICK } from '../../content/companions/ReturnLostWick.js';

function defaultConsequences(existing) {
	return {
		applied: Boolean(existing?.applied),
		tradeMultiplier: Number(existing?.tradeMultiplier || 1),
		veilMultiplier: Number(existing?.veilMultiplier || 1),
		bonusBondReason: existing?.bonusBondReason || null,
		line: existing?.line || ''
	};
}

function defaultLead(existing) {
	return {
		id: RETURN_LOST_WICK.id,
		category: 'Companion Shlichus',
		title: RETURN_LOST_WICK.title,
		objective: existing?.objective || 'Make Nerel lead, face a road, and press Action to follow Lantern Sense.',
		region: 'Bent Reeds',
		entrustedBy: RETURN_LOST_WICK.entrustedBy,
		status: existing?.status || 'unlocked',
		stage: existing?.stage || existing?.status || 'unlocked',
		discoveredTraces: { ...(existing?.discoveredTraces || {}) },
		traceOrder: Array.isArray(existing?.traceOrder) ? [...existing.traceOrder] : [],
		approachId: existing?.approachId || null,
		consequences: defaultConsequences(existing?.consequences),
		conversationViewed: Boolean(existing?.conversationViewed),
		startedAt: existing?.startedAt || null,
		completedAt: existing?.completedAt || null,
		linkedSystems: ['Lantern Sense', 'World State', 'Trade Route', 'Nitzotz Bond', 'Battle Veil']
	};
}

export function ensureReturnLostWickState() {
	State.Missions ||= {};
	State.Missions.companionLeads ||= {};
	const existing = State.Missions.companionLeads.nerel;
	if (!existing) {
		return null;
	}
	const normalized = { ...existing, ...defaultLead(existing) };
	State.Missions.companionLeads.nerel = normalized;
	return normalized;
}

export function returnLostWickUnlocked() {
	const knowsNerel = Boolean(State.Party?.known?.nerel);
	const hasLanternSense = Boolean(State.Party?.abilities?.['lantern-sense']);
	return Boolean(knowsNerel && hasLanternSense && ensureReturnLostWickState());
}

export function discoveredTraceCount(lead) {
	return RETURN_LOST_WICK.traces.filter(trace => lead?.discoveredTraces?.[trace.id]).length;
}
