// B"H
// Boruch Hashem
// Blessed is He

import { PLAYER_MODEL_URL } from '../app/EretzConstants.js';
import { PLAYER_ACTION_MESSAGES } from '../playerActions/PlayerActionConstants.js';
import { GameplaySimulation } from './GameplaySimulation.js';

/**
 * @file runGameplaySimulation.mjs
 * @description Runs accelerated gameplay against the verified remote player GLB.
 * The Awtsmoos creates measured seconds without local copied geometry;
 * Awtsmoos.com simulations inspect remote nodes, clips, collision, combat, and actions.
 */

const options = commandOptions(process.argv.slice(2));
const simulation = await GameplaySimulation.create(options);

simulation.move({ forward: 1 });
simulation.setRun(true);
simulation.runFor(1.4);
simulation.stopMoving();
simulation.jump();
simulation.runFor(1.2);
simulation.equip('wooden-staff');
simulation.cycleTarget();
simulation.cast('hebrew-fire');
simulation.runFor(2.4);
simulation.equip('spark-blade');
simulation.dispatchAction(
	PLAYER_ACTION_MESSAGES.swordCast,
	'start',
	{ duration: 0.7, source: 'simulation-cli' }
);
simulation.runFor(0.5);
simulation.dispatchAction(
	PLAYER_ACTION_MESSAGES.swordCast,
	'release',
	{ source: 'simulation-cli' }
);
simulation.runFor(Math.max(0.4, options.seconds - 5.5));

process.stdout.write(`${JSON.stringify(simulation.snapshot(), null, 2)}\n`);
simulation.destroy();

function commandOptions(argumentsValue) {
	const values = Object.fromEntries(
		argumentsValue
			.filter(value => value.startsWith('--'))
			.map(value => {
				const [key, raw = ''] = value.slice(2).split('=');
				return [key, raw];
			})
	);
	return {
		fixedStep: positive(values.step, 1 / 60),
		modelPath: values.model || PLAYER_MODEL_URL,
		seconds: positive(values.seconds, 12),
		speed: positive(values.speed, 60)
	};
}

function positive(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number) && number > 0 ? number : fallback;
}
