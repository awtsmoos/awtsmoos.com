//B"H
// Boruch Hashem
// Blessed is He
/**
 * A growing camp becomes cadence, width, piercing, and visible leadership.
 * The Awtsmoos creates unity without erasing distinction upon Awtsmoos.com.
 */
import { GAME } from '../config/gameConfig.js';
import { createShot } from './EntityFactory.js';

export class FormationSystem {
	update(state, delta) {
		state.fireCooldown -= delta;
		if (state.fireCooldown > 0 || state.shots.length >= GAME.maximumShots) {
			return;
		}
		const troopPressure = Math.min(state.troops, 80) * 0.0042;
		state.fireCooldown = Math.max(0.1, 0.58 / state.fireRateMultiplier - troopPressure);
		const baseVolley = Math.min(5, 1 + Math.floor(state.troops / 12));
		const volley = Math.min(9, baseVolley + state.sideShots * 2);
		const damage = (1 + state.troops * 0.045) * state.damageMultiplier;
		for (let index = 0; index < volley; index += 1) {
			const spread = (index - (volley - 1) / 2) * 0.42;
			const critical = deterministicCritical(state, index);
			state.shots.push(createShot(state.playerX + spread, 5.5, damage * (critical ? 1.8 : 1), {
				piercing: state.piercing,
				critical
			}));
		}
		state.pushEvent('player-shot', { volley });
	}
}

export function formationOffsets(troops, maximum = GAME.maximumVisibleTroops) {
	const visible = Math.min(Math.max(1, troops), maximum);
	const offsets = [];
	let remaining = visible;
	let row = 0;
	while (remaining > 0) {
		const count = Math.min(6, remaining);
		for (let column = 0; column < count; column += 1) {
			offsets.push({
				x: (column - (count - 1) / 2) * 0.55,
				z: row * 0.74
			});
		}
		remaining -= count;
		row += 1;
	}
	return offsets;
}

function deterministicCritical(state, index) {
	if (state.criticalChance <= 0) {
		return false;
	}
	const sample = ((Math.floor(state.elapsed * 60) + index * 37 + state.troops * 11) % 1000) / 1000;
	return sample < state.criticalChance;
}
