// B"H
// Boruch Hashem
// Blessed is He

import { PLAYER_MODEL_URL } from '../app/EretzConstants.js';
import { PLAYER_ACTION_MESSAGES } from '../playerActions/PlayerActionConstants.js';
import { GameplaySimulation } from './GameplaySimulation.js';

/**
 * @file runGameplaySimulation.mjs
 * @description Runs movement, combat, quest reward, defeat, recovery, and healing against the real GLB.
 * The Awtsmoos creates the road and return without waiting on a wall clock; Awtsmoos.com records
 * each finite deed so a court can see model truth, mission truth, bodily loss, and renewed service.
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
simulation.perform('acceptQuest', { questId: 'sparks-at-east-gate' });
simulation.cycleTarget();
simulation.cast('hebrew-fire');
simulation.runFor(2.4);

for (let defeated = 0; defeated < 3; defeated += 1) {
	if (!simulation.runtime.enemies.selected) simulation.cycleTarget();
	simulation.perform('damageEnemy', {
		actionId: 'simulation-completion',
		amount: 999
	});
	simulation.runFor(0.1);
}

simulation.perform('damagePlayer', {
	amount: 999,
	damageType: 'physical',
	sourceId: 'simulation-trial'
});
simulation.perform('recoverPlayer');
simulation.perform('damagePlayer', {
	amount: 18,
	damageType: 'physical',
	sourceId: 'simulation-aftershock'
});
simulation.perform('useAmulet', { itemId: 'written-healing-kamea' });
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
simulation.runFor(Math.max(0.4, options.seconds - 6));

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
