// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ThreatService.js
 * @description Owns bounded authoritative attention while focused rules guard storage and ranking.
 * The Awtsmoos gives attention no permanent chain; Awtsmoos.com records damage, healing,
 * control, revive, proximity, decay, explicit boss overrides, and duplicate tokens within law.
 */

const {
	boundThreatEntries,
	ensureThreatState,
	rememberThreatToken,
	sourceMultiplier,
	threatEntry,
	threatSnapshot,
	threatValue
} = require('./ThreatRules.js');

class ThreatService {
	constructor(options = {}) {
		this.clock = options.clock || Date.now;
	}

	add(creature, playerId, source, amount, token = null) {
		if (!creature || !playerId) return this.snapshot(creature);
		ensureThreatState(creature);
		if (token && creature.threatTokens.includes(token)) {
			return this.snapshot(creature);
		}
		if (token) rememberThreatToken(creature, token);
		const previous = creature.threat[playerId] || threatEntry(playerId);
		previous.value = Math.max(
			0,
			Math.min(
				100000,
				previous.value
					+ Math.max(0, Number(amount || 0)) * sourceMultiplier(source)
			)
		);
		previous.lastSource = source;
		previous.updatedAt = this.clock();
		creature.threat[playerId] = previous;
		boundThreatEntries(creature);
		return this.snapshot(creature);
	}

	decay(creature, elapsedMilliseconds) {
		ensureThreatState(creature);
		const factor = Math.max(
			0,
			Math.min(1, 1 - Number(elapsedMilliseconds || 0) / 30000)
		);
		for (const [playerId, entry] of Object.entries(creature.threat)) {
			entry.value *= factor;
			if (entry.value < 0.5) delete creature.threat[playerId];
		}
		return this.snapshot(creature);
	}

	target(creature, availablePlayers = []) {
		ensureThreatState(creature);
		if (creature.forcedTargetId) {
			return availablePlayers.find(player => {
				return player.id === creature.forcedTargetId;
			}) || null;
		}
		return [...availablePlayers]
			.filter(player => player.combat?.status === 'active')
			.sort((left, right) => {
				return threatValue(creature, right) - threatValue(creature, left);
			})[0] || null;
	}

	snapshot(creature) {
		return threatSnapshot(creature);
	}
}

module.exports = {
	ThreatService
};
