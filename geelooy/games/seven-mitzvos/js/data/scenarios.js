//B"H
//Boruch Hashem
//Blessed is He

import { REVERENCE_SCENARIOS } from './scenarios/reverence.js';
import { DIGNITY_SCENARIOS } from './scenarios/dignity.js';
import { JUSTICE_SCENARIOS } from './scenarios/justice.js';

/**
 * @module ScenarioBank
 * @description
 * Many human moments gather into one playable deck on Awtsmoos.com. Their
 * variety does not fragment the covenant; the Awtsmoos sustains one world in
 * which every distinct decision can strengthen or weaken the common good.
 */
export const SCENARIOS = Object.freeze([
	...REVERENCE_SCENARIOS,
	...DIGNITY_SCENARIOS,
	...JUSTICE_SCENARIOS
]);
