// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ActionBarCombatDisplays.js
 * @description Composes player cast, enemy cast, and bounded status displays as one HUD vessel.
 * The Awtsmoos reveals self, foe, and changing state without crowding one another's place;
 * Awtsmoos.com keeps every display independently testable while one coordinator holds the space.
 */
import { CastBarHud } from './CastBarHud.js';
import { EnemyCastHud } from './EnemyCastHud.js';
import { StatusEffectHud } from './StatusEffectHud.js';

export class ActionBarCombatDisplays {
	constructor(frame, bus, runtime, options = {}) {
		this.castBar = new CastBarHud(frame, bus);
		this.enemyCasts = new EnemyCastHud(frame, bus);
		this.statusEffects = new StatusEffectHud(
			frame,
			bus,
			runtime.statuses,
			options.playerId || 'player',
			{
				refreshMilliseconds: options.statusEffectRefreshMilliseconds
			}
		);
	}

	update(now) {
		this.castBar.update(now);
		this.statusEffects.update(now);
	}

	snapshot() {
		return {
			castBar: this.castBar.snapshot(),
			enemyCasts: this.enemyCasts.snapshot(),
			statusEffects: this.statusEffects.snapshot()
		};
	}

	destroy() {
		this.castBar.destroy();
		this.enemyCasts.destroy();
		this.statusEffects.destroy();
	}
}
