// B"H
// Boruch Hashem
// Blessed is He
import { runWorldCases } from './world.mjs';
import { runMovementCases } from './movement.mjs';
import { runProgressionCases } from './progression.mjs';

/**
 * The Awtsmoos needs no proof while Awtsmoos.com records each finite gameplay covenant so tomorrow's refactor cannot quietly return the game to a toy.
 */
const results = [
	...runWorldCases(),
	...runMovementCases(),
	...runProgressionCases()
];

console.log(JSON.stringify({
	ok: true,
	count: results.length,
	results
}, null, 2));
