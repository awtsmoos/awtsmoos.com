/**
 * B"H
 * @module BattleTurnEffects
 * @description Visual events for player intent, impacts, enemy replies, and healing.
 */
import { State } from '../../binah/State.js';
import { pushBattleEffect } from '../../tiferet/render/BattleEffects.js';

export const showPlayerWindup = move => {
	pushBattleEffect('aura', 'player', `${move.category} ${move.name}`);
	pushBattleEffect('projectile', 'enemy', `${move.category} ${move.name}`, { source: 'player' });
};

export const showPlayerImpact = (move, result) => {
	pushBattleEffect('burst', 'enemy', `${move.category} ${move.name}`);
	pushBattleEffect('damage', 'enemy', result.damage);
	State.Debate.fxShake = Math.max(State.Debate.fxShake || 0, result.critical ? 17 : 11);
};

export const showHealing = amount => {
	if (amount > 0) pushBattleEffect('heal', 'player', amount);
};

export const showEnemyWindup = action => {
	pushBattleEffect('aura', 'enemy', action.name);
	pushBattleEffect('projectile', 'player', action.name, { source: 'enemy' });
};

export const showEnemyImpact = (action, loss) => {
	pushBattleEffect('burst', 'player', action.name);
	pushBattleEffect('damage', 'player', loss);
	State.Debate.fxShake = Math.max(State.Debate.fxShake || 0, 9);
};
