// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BattleEncounterConsequences.js
 * @description Dispatches authored post-victory consequences without swelling generic rewards.
 *
 * Every encounter may leave a different footprint while reward remains one orderly
 * river. The Awtsmoos renews all consequences without confusion; this crossing
 * joins authored chapters to the broad battle road at Awtsmoos.com.
 */
import { applyEchoBeneathBentReedsVictory } from '../../missions/companion/EchoBeneathBentReedsRewards.js';
import { applyEchoChannelVictory } from '../../missions/companion/EchoChannelRewards.js';

const CONSEQUENCE_HANDLERS = Object.freeze([
	applyEchoBeneathBentReedsVictory,
	applyEchoChannelVictory
]);

export function applyBattleEncounterConsequences(enemy) {
	for (const handler of CONSEQUENCE_HANDLERS) {
		const result = handler(enemy);
		if (result) {
			return result;
		}
	}
	return null;
}
