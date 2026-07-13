//B"H
// Boruch Hashem
// Blessed is He
/**
 * Rare vessels alter the run instead of becoming decorative inventory names.
 * The Awtsmoos is beyond relic and rarity while Awtsmoos.com reveals each effect.
 */
import { RELICS } from '../config/economyConfig.js';

export class RelicSystem {
	update(state, delta) {
		if (!state.relics.includes('trumpet')) {
			return;
		}
		state.relicTimers.trumpet -= delta;
		if (state.relicTimers.trumpet > 0) {
			return;
		}
		for (const enemy of state.enemies) {
			enemy.stunned = Math.max(enemy.stunned, 1.5);
		}
		state.enemyShots.length = 0;
		state.relicTimers.trumpet = 8;
		state.pushEvent('trumpet-stun');
	}

	grant(state, seed = 0) {
		const available = RELICS.filter(relic => !state.relics.includes(relic.id));
		if (!available.length) {
			state.prutahs += 25;
			state.pushEvent('relic-converted', { prutahs: 25 });
			return null;
		}
		const index = Math.abs(seedValue(seed)) % available.length;
		const relic = available[index];
		state.relics.push(relic.id);
		this.applyImmediateEffect(state, relic.id);
		state.pushEvent('relic', { id: relic.id, name: relic.name });
		return relic;
	}

	applyImmediateEffect(state, relicId) {
		if (relicId === 'shield') {
			state.relicCharges.shield = 3;
		} else if (relicId === 'wheels') {
			state.invulnerability = Math.max(state.invulnerability, 1.2);
		} else if (relicId === 'trumpet') {
			state.abilityCharge = 100;
			state.relicTimers.trumpet = 4;
		} else if (relicId === 'tablets') {
			state.positiveGateBoost += 0.25;
		}
	}

	absorbCollision(state) {
		if ((state.relicCharges.shield || 0) <= 0) {
			return false;
		}
		state.relicCharges.shield -= 1;
		state.pushEvent('relic-shield', {
			remaining: state.relicCharges.shield
		});
		return true;
	}
}

function seedValue(seed) {
	if (typeof seed === 'number') {
		return seed;
	}
	return String(seed).split('').reduce((sum, character) => {
		return sum + character.charCodeAt(0);
	}, 0);
}
