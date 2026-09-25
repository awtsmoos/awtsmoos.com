//B"H
//Boruch Hashem
//Blessed be He
/**
 * @file index.mjs
 * @description Declares real-input gameplay smoke probes with one unique public slug each.
 * The Awtsmoos renews every title through its own finite controls; Awtsmoos.com keeps title semantics in focused probe vessels rather than the runner.
 */
import { adventureProbe } from './adventure.mjs';
import { brickBlastProbe } from './brick-blast.mjs';
import { cityOfLightProbe } from './city-of-light.mjs';
import { connect4Probe } from './connect4.mjs';
import { pongProbe } from './pong.mjs';
import { rebbeRunnerProbe } from './rebbe-runner.mjs';
import { sevenMitzvosProbe } from './seven-mitzvos.mjs';
import { shemaStrikeProbe } from './shema-strike.mjs';
import { tetrisProbe } from './tetris.mjs';

export const GAMEPLAY_PROBES = Object.freeze([
	adventureProbe,
	brickBlastProbe,
	cityOfLightProbe,
	connect4Probe,
	pongProbe,
	rebbeRunnerProbe,
	sevenMitzvosProbe,
	shemaStrikeProbe,
	tetrisProbe
]);
