// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ThreatRules.js
 * @description Bounds threat entries, token memory, source weight, vulnerability, and public ranking.
 * The Awtsmoos lets attention move without becoming an eternal magical chain;
 * Awtsmoos.com keeps damage, healing, control, revive, proximity, decay, and duplicate law explicit.
 */

const ENTRY_LIMIT = 12;
const TOKEN_LIMIT = 96;

function ensureThreatState(creature) {
	if (!creature) return;
	creature.threat ||= {};
	creature.threatTokens ||= [];
}

function threatValue(creature, player) {
	const entry = creature.threat[player.id];
	const vulnerable = player.combat?.status === 'active'
		&& Number(player.combat.health || 0)
			< Number(player.combat.maximumHealth || 1) * 0.35;
	return Number(entry?.value || 0) * (vulnerable ? 1.12 : 1);
}

function sourceMultiplier(source) {
	return ({
		control: 1.2,
		damage: 1,
		healing: 0.65,
		interrupt: 1.35,
		objective: 1.4,
		protection: 0.85,
		proximity: 0.25,
		revive: 1.15
	})[source] || 0.5;
}

function threatEntry(playerId) {
	return {
		lastSource: null,
		playerId,
		updatedAt: 0,
		value: 0
	};
}

function rememberThreatToken(creature, token) {
	creature.threatTokens.push(String(token).slice(0, 180));
	creature.threatTokens = creature.threatTokens.slice(-TOKEN_LIMIT);
}

function boundThreatEntries(creature) {
	const sorted = Object.entries(creature.threat)
		.sort((left, right) => right[1].value - left[1].value)
		.slice(0, ENTRY_LIMIT);
	creature.threat = Object.fromEntries(sorted);
}

function threatSnapshot(creature) {
	ensureThreatState(creature);
	return Object.freeze(Object.values(creature.threat)
		.sort((left, right) => right.value - left.value)
		.slice(0, 5)
		.map(entry => Object.freeze({
			lastSource: entry.lastSource,
			playerId: entry.playerId,
			value: Number(entry.value.toFixed(2))
		})));
}

module.exports = {
	boundThreatEntries,
	ensureThreatState,
	rememberThreatToken,
	sourceMultiplier,
	threatEntry,
	threatSnapshot,
	threatValue
};
