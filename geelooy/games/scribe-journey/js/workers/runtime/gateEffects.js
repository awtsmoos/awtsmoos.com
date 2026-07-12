// B"H

import { apply666Features } from '../../data/features_666.js';
import { gates } from '../../data/gates_features.js';
import { gates37 } from '../../data/gates_37.js';

function baseEffects() {
	return {
		speedMult: 1.5,
		timeSpeed: 1,
		filters: [],
		overlay: null,
		combat: { damageMult: 1, defenseMult: 1, healMult: 1, xpMult: 1, dropMult: 1, immunities: [] },
		world: { encounterRate: 1 }
	};
}

function applyFeatureEffects(state, effects) {
	apply666Features(state);
	if (!state.features666) return;
	effects.speedMult *= state.features666.speedMult;
	if (state.features666.filters) effects.filters.push(...state.features666.filters);
	if (state.features666.chaos) effects.world.chaosMode = true;
}

function applyGateEffects(state, effects) {
	for (const gate of gates) {
		if (!state.activeGates[gate.id]) continue;
		const effect = gate.effect;
		if (gate.type === 'movement' && effect.speedMult) effects.speedMult *= effect.speedMult;
		if (gate.type === 'visual' && effect.overlay) effects.overlay = effect.overlay;
		if (gate.type === 'combat' && effect.damageMult) effects.combat.damageMult *= effect.damageMult;
		if (gate.type === 'combat' && effect.autoWin) effects.combat.autoWin = true;
		if (gate.type === 'combat' && effect.dropMult) effects.combat.dropMult *= effect.dropMult;
		if (gate.type === 'world' && effect.encounterRate !== undefined) effects.world.encounterRate *= effect.encounterRate;
	}
}

function applyWisdomGate(effect, effects) {
	if (effect.type === 'immune_status') effects.combat.immunities.push(effect.status);
	if (effect.type === 'drop_rate') effects.combat.dropMult *= effect.amount;
	if (effect.type === 'damage_reduction') effects.combat.defenseMult /= effect.amount;
	if (effect.type === 'heal_mult') effects.combat.healMult *= effect.amount;
	if (effect.type === 'encounter_rate') effects.world.encounterRate *= effect.amount;
	if (effect.type === 'stat_boost' && effect.stat === 'attack') effects.combat.damageMult *= effect.amount;
	if (effect.type === 'money_mult') effects.combat.moneyMult = (effects.combat.moneyMult || 1) * effect.amount;
	if (effect.type === 'xp_mult') effects.combat.xpMult = (effects.combat.xpMult || 1) * effect.amount;
	if (effect.type === 'endure_fatal') effects.combat.endureFatal = true;
	if (effect.type === 'ultimate_move') effects.combat.hasUltimate = true;
}

/** Derives every gate effect anew so the Chronicle stores causes, never shadows. */
export function deriveGateEffects(state) {
	state.activeGates ||= {};
	state.player.unlockedGates37 ||= [];
	const effects = baseEffects();
	applyFeatureEffects(state, effects);
	applyGateEffects(state, effects);
	for (const gateId of state.player.unlockedGates37) {
		const gate = gates37.find(candidate => candidate.id === gateId);
		if (gate) applyWisdomGate(gate.effect, effects);
	}
	state.gateEffects = effects;
	return effects;
}
