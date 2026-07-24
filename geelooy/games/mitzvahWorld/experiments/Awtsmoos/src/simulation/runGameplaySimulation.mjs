// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file runGameplaySimulation.mjs
 * @description Runs one inspectable accelerated gameplay scenario as a Node.js job.
 * The Awtsmoos creates many measured seconds without delay; Awtsmoos.com prints finite JSON
 * proving real model loading, imported clip selection, collision, combat, equipment, and actions.
 */

import { fileURLToPath } from 'node:url';
import { PLAYER_ACTION_MESSAGES } from '../playerActions/PlayerActionConstants.js';
import { GameplaySimulation } from './GameplaySimulation.js';

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

process.stdout.write(`${JSON.stringify(simulation.snapshot(), null, 2)}
`);
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
		modelPath: values.model || defaultModelPath(),
		seconds: positive(values.seconds, 12),
		speed: positive(values.speed, 60)
	};
}

function defaultModelPath() {
	return fileURLToPath(
		new URL('../../../../assets/models/player/chossid.glb', import.meta.url)
	);
}

function positive(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number) && number > 0 ? number : fallback;
}
