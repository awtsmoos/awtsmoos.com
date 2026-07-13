//B"H
// Boruch Hashem
// Blessed is He
/**
 * Gates, enemy bodies, and hostile light meet the chariot through one damage path.
 * The Awtsmoos creates every meeting anew while Awtsmoos.com reveals consequence.
 */
import { GAME } from '../config/gameConfig.js';
import { applyGateValue, damagePacket } from './GameRules.js';

export class PlayerCollisionSystem {
	constructor(relics) {
		this.relics = relics;
	}

	resolve(state) {
		this.resolveGates(state);
		this.resolveEnemies(state);
		this.resolveEnemyShots(state);
	}

	resolveGates(state) {
		for (const gate of state.gates) {
			const close = Math.abs(gate.z - GAME.gateCollisionZ) <= 1.25;
			const aligned = Math.abs(gate.x - state.playerX) < 1.45;
			if (gate.consumed || !close || !aligned) {
				continue;
			}
			gate.consumed = true;
			const before = state.troops;
			const boost = gate.kind === 'positive' ? state.positiveGateBoost : 1;
			state.troops = applyGateValue(before, gate.operation, gate.value, boost);
			state.pushEvent('gate', {
				label: gate.label,
				before,
				after: state.troops,
				kind: gate.kind
			});
		}
	}

	resolveEnemies(state) {
		for (let index = state.enemies.length - 1; index >= 0; index -= 1) {
			const enemy = state.enemies[index];
			const close = Math.abs(enemy.z - GAME.playerCollisionZ) < 1.3;
			const aligned = Math.abs(enemy.x - state.playerX) < enemy.width;
			if (!close || !aligned) {
				continue;
			}
			state.enemies.splice(index, 1);
			this.damage(state, enemy.damage, enemy.type);
			this.applyEnemyContactEffect(state, enemy.type);
		}
	}

	resolveEnemyShots(state) {
		for (let index = state.enemyShots.length - 1; index >= 0; index -= 1) {
			const shot = state.enemyShots[index];
			const close = Math.abs(shot.z - GAME.playerCollisionZ) < 1.1;
			const aligned = Math.abs(shot.x - state.playerX) < 1.25;
			if (!close || !aligned) {
				continue;
			}
			state.enemyShots.splice(index, 1);
			this.damage(state, shot.damage, 'projectile');
		}
	}

	applyEnemyContactEffect(state, type) {
		if (type === 'drainer') {
			state.fireRateMultiplier = Math.max(0.65, state.fireRateMultiplier * 0.9);
		} else if (type === 'thief') {
			state.prutahs = Math.max(0, state.prutahs - 8);
		}
	}

	damage(state, amount, source) {
		if (state.invulnerability > 0) {
			return;
		}
		if (this.relics.absorbCollision(state)) {
			state.invulnerability = 0.45;
			return;
		}
		const result = damagePacket(state, amount);
		state.shield = result.shield;
		state.troops = result.troops;
		state.health = result.health;
		state.invulnerability = 0.72;
		state.combo = 0;
		state.pushEvent(result.absorbed ? 'shield-hit' : 'damage', {
			amount,
			source
		});
	}
}
