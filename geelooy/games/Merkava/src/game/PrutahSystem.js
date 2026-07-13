//B"H
// Boruch Hashem
// Blessed is He
/**
 * Small coins become urgent routes, streaks, future choices, and endless risk rewards.
 * Their finite value shines as the Awtsmoos grants the instant through Awtsmoos.com.
 */
import { GAME } from '../config/gameConfig.js';
import { scaleEndlessReward } from '../modes/EndlessRules.js';
import { isEndlessMode } from '../modes/RunModeCatalog.js';
import { nextCombo, prutahReward } from './GameRules.js';

export class PrutahSystem {
	update(state, delta) {
		state.comboAge += delta;
		if (state.comboAge > GAME.comboWindow && state.combo > 0) {
			state.combo = 0;
			state.pushEvent('combo-broken');
		}
		for (const coin of state.prutahItems) {
			coin.spin += delta * (coin.golden ? 5 : 3);
			this.applyMagnet(state, coin, delta);
		}
	}

	collect(state, coin) {
		state.combo = nextCombo(state.combo, state.comboAge);
		state.comboAge = 0;
		state.highestCombo = Math.max(state.highestCombo, state.combo);
		const baseReward = prutahReward(
			state.combo,
			coin.golden,
			state.prutahValueMultiplier
		);
		const reward = isEndlessMode(state) ?
			scaleEndlessReward(state, baseReward) : baseReward;
		state.prutahs += reward;
		state.score += reward * 12;
		state.abilityCharge = Math.min(
			GAME.abilityThreshold,
			state.abilityCharge + (coin.golden ? 12 : 4)
		);
		state.blessingFragments += coin.golden ? 2 : 1;
		state.blessing += coin.golden ? 8 : 2;
		coin.collected = true;
		state.pushEvent('prutah', {
			reward,
			golden: coin.golden,
			combo: state.combo
		});
		if (state.combo > 0 && state.combo % 5 === 0) {
			state.pushEvent('combo', { combo: state.combo });
		}
		return reward;
	}

	applyMagnet(state, coin, delta) {
		const zDistance = Math.abs(coin.z - GAME.playerCollisionZ);
		const xDistance = state.playerX - coin.x;
		const tooFar = zDistance > state.magnetRadius * 2.4 ||
			Math.abs(xDistance) > state.magnetRadius * 2;
		if (tooFar) {
			return;
		}
		coin.x += xDistance * Math.min(1, delta * 8);
		coin.z += (GAME.playerCollisionZ - coin.z) * Math.min(1, delta * 5);
	}
}
