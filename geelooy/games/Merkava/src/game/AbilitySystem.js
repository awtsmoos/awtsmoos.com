//B"H
// Boruch Hashem
// Blessed is He
/**
 * Stored courage becomes a chosen command rather than an automatic decoration.
 * The Awtsmoos is beyond charge and release while Awtsmoos.com reveals both.
 */
import { GAME } from '../config/gameConfig.js';

export const ABILITIES = Object.freeze([
	{
		id: 'lightBurst',
		name: 'Light Burst',
		description: 'Destroys hostile shots and burns every nearby enemy.'
	},
	{
		id: 'gatheringCall',
		name: 'Gathering Call',
		description: 'Pulls every visible spark and Prutah to the Merkava.'
	},
	{
		id: 'shofarBlast',
		name: 'Shofar Blast',
		description: 'Stuns the enemy army and clears hostile projectiles.'
	}
]);

export class AbilitySystem {
	update(state, delta) {
		state.abilityCooldown = Math.max(0, state.abilityCooldown - delta);
	}

	choices() {
		return ABILITIES.map(ability => ({ ...ability }));
	}

	choose(state, abilityId) {
		if (!ABILITIES.some(ability => ability.id === abilityId)) {
			return false;
		}
		state.abilityId = abilityId;
		state.abilityChosen = true;
		state.pushEvent('ability-chosen', { id: abilityId });
		return true;
	}

	activate(state) {
		const ready = state.running &&
			!state.paused &&
			state.abilityCharge >= GAME.abilityThreshold &&
			state.abilityCooldown <= 0;
		if (!ready) {
			return false;
		}
		state.abilityCharge = 0;
		state.abilityCooldown = 0.8;
		if (state.abilityId === 'gatheringCall') {
			this.gather(state);
		} else if (state.abilityId === 'shofarBlast') {
			this.stun(state);
		} else {
			this.burst(state);
		}
		if (state.relics.includes('trumpet')) {
			this.stun(state);
		}
		state.pushEvent('ability', { id: state.abilityId });
		return true;
	}

	burst(state) {
		state.enemyShots.length = 0;
		for (const enemy of state.enemies) {
			enemy.health -= 24 * state.damageMultiplier;
			enemy.hitFlash = 0.25;
		}
		if (state.boss) {
			state.boss.health -= 45 * state.damageMultiplier;
		}
	}

	gather(state) {
		for (const entity of [...state.prutahItems, ...state.sparks]) {
			entity.x = state.playerX;
			entity.z = 7.5;
		}
	}

	stun(state) {
		state.enemyShots.length = 0;
		for (const enemy of state.enemies) {
			enemy.stunned = 3;
		}
		state.stunTimer = 3;
	}
}
