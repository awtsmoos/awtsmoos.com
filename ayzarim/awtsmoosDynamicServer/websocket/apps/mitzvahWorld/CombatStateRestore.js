// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CombatStateRestore.js
 * @description Normalizes bounded combat statuses and replay tokens from persisted records.
 * The Awtsmoos renews memory without allowing old fragments to rule the present;
 * Awtsmoos.com keeps migration finite, typed, and safe beneath every reconnect descent.
 */

const COMBAT_STATUS_LIMIT = 24;
const RECENT_IMPACT_LIMIT = 64;

function restoredImpactTokens(combat = {}) {
	const source = Array.isArray(combat.recentImpactTokens)
		? combat.recentImpactTokens
		: legacyImpactTokens(combat);
	return source
		.filter(entry => entry && typeof entry.token === 'string')
		.map(entry => ({
			at: finite(entry.at),
			token: entry.token.slice(0, 160)
		}))
		.slice(-RECENT_IMPACT_LIMIT);
}

function restoredStatuses(source) {
	return (Array.isArray(source) ? source : [])
		.filter(status => status && typeof status.id === 'string')
		.map(status => ({
			expiresAt: finite(status.expiresAt),
			id: status.id,
			nextTickAt: finite(status.nextTickAt),
			sourceActionId: status.sourceActionId || null,
			sourceActorId: status.sourceActorId || null,
			startedAt: finite(status.startedAt),
			stacks: Math.max(1, finite(status.stacks))
		}))
		.slice(-COMBAT_STATUS_LIMIT);
}

function legacyImpactTokens(combat) {
	return combat.lastImpactToken
		? [{ at: Date.now(), token: String(combat.lastImpactToken) }]
		: [];
}

function finite(value) {
	return Number.isFinite(Number(value)) ? Number(value) : 0;
}

module.exports = {
	restoredImpactTokens,
	restoredStatuses
};
