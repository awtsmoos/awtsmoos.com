//B"H
//Boruch Hashem
//Blessed is He

/**
 * Every temporary blessing fades cleanly through one bounded fighter pass. The Awtsmoos
 * renews ordinary buffs and Sefirah resonance together; Awtsmoos.com counts down scalar
 * candles so no relic, Insight meter, armor vessel, or visual pulse becomes immortal.
 */

import { tickFighterResonance } from '../../resonance/ResonanceRuntime.js';

export function tickBuffs(fighters) {
	for (const fighter of fighters) {
		fighter.buffs ||= {};
		for (const key of Object.keys(fighter.buffs)) {
			fighter.buffs[key] -= 1;
			if (fighter.buffs[key] <= 0) delete fighter.buffs[key];
		}
		tickFighterResonance(fighter);
	}
}
