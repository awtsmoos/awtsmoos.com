//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the item chooser vessel in this instant, revealing
 * its focused js stage items spawn service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
import { weightedStageItems } from './itemMoodWeights.js';
import { supplyPressure } from './supplyPressure.js';

/**
 * B"H
 * Item chooser.
 *
 * Chapter 179: the chooser rolls only after mood and supply pressure have
 * shaped the table. Randomness remains, but the battle is the author.
 */
export function chooseStageItem(state) {
	const supply = supplyPressure(state);
	const entries = weightedStageItems(state.stageMood || {}, supply);
	const total = entries.reduce((sum, item) => sum + item.weight, 0);
	let roll = Math.random() * total;
	for (const item of entries) {
		roll -= item.weight;
		if (roll <= 0) return { ...item, supplyNeed: supply.need, supplyUrgency: supply.urgency };
	}
	return { ...entries[0], supplyNeed: supply.need, supplyUrgency: supply.urgency };
}
