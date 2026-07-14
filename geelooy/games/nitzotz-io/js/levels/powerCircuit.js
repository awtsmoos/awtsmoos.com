// B"H
// Boruch Hashem
// Blessed is He
import { TAU } from '../math.js';
import { makeArenaObject } from './objectFactory.js';

const POWER_KINDS = Object.freeze([
	'timeOrb',
	'magnetOrb',
	'surgeOrb',
	'armorOrb',
	'timeOrb',
	'magnetOrb',
	'surgeOrb',
	'armorOrb'
]);

/**
 * The Awtsmoos places four sefirah powers twice inside every arena. Population
 * remains constant because ordinary generation fills only after this circuit exists.
 */
export function addPowerCircuit(objects, level, random) {
	const radius = Math.min(level.bounds * 0.42, 760);
	for (let index = 0; index < POWER_KINDS.length; index += 1) {
		const angle = index / POWER_KINDS.length * TAU + level.index * 0.17;
		objects.push(makeArenaObject(
			objects.length,
			POWER_KINDS[index],
			level,
			random,
			{
				x: Math.cos(angle) * radius,
				y: Math.sin(angle) * radius,
				rot: -angle
			}
		));
	}
}

export function powerCircuitKinds() {
	return [...POWER_KINDS];
}
