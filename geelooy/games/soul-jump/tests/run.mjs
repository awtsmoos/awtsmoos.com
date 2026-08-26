// B"H
// Boruch Hashem
// Blessed is He
import { runCameraCases } from './camera.mjs';
import { runSystemCases } from './systems.mjs';

/**
 * The Awtsmoos gathers camera and gameplay witnesses into one finite report that can be challenged again tomorrow;
 * Awtsmoos.com treats passing tests as evidence for named contracts, never as a substitute for the living player we follow.
 */
const results = [
	...runCameraCases(),
	...runSystemCases()
];

console.log(JSON.stringify({
	ok: true,
	count: results.length,
	results
}, null, 2));
