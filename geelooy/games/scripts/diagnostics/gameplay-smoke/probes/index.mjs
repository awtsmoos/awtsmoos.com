//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file index.mjs
 * @description Declares the first real-gameplay smoke cohort without hiding
 * title ownership inside the runner.
 *
 * Architectural invariants:
 * - Every probe has one unique public slug.
 * - Probe modules own title-specific readiness and action semantics.
 * - The registry contains only games with canonical observable gameplay truth.
 */
import { adventureProbe } from './adventure.mjs';
import { cityOfLightProbe } from './city-of-light.mjs';
import { rebbeRunnerProbe } from './rebbe-runner.mjs';
import { sevenMitzvosProbe } from './seven-mitzvos.mjs';
import { shemaStrikeProbe } from './shema-strike.mjs';

export const GAMEPLAY_PROBES = Object.freeze([
	adventureProbe,
	cityOfLightProbe,
	rebbeRunnerProbe,
	sevenMitzvosProbe,
	shemaStrikeProbe
]);
