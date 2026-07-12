// B"H
import { quality } from '../performance.js';
import { cmd, shadow } from './command.js';
import { visibleObjects } from './culling.js';

/** Composite models, boss seals, crowds, and pickups share one cached render path. */
export function objectCommands(commands, world, time) {
	const renderQuality = quality(world);
	for (const object of visibleObjects(world)) addObject(commands, object, time, renderQuality);
}

function addObject(commands, object, time, renderQuality) {
	const sink = object.sink || 0;
	const shrink = Math.max(0.06, 1 - sink * 0.86);
	const rare = object.rare || object.mass > 95 || object.category === 'pickup';
	const pulse = 1 + (rare ? 0.045 * Math.sin(time * 3.2 + Number(object.id)) : 0);
	const baseHeight = object.grounded ? object.z : object.z + object.h * 0.5;
	const height = baseHeight - sink * object.h * 0.96;
	const tint = object.shape.startsWith('model:') ? [1, 1, 1] : object.color;
	if (sink < 0.18 && (rare || renderQuality > 0.72)) {
		shadow(commands, object.x, object.y, object.z, object.r * 0.92, rare ? 0.24 : 0.12);
	}
	commands.push(cmd(
		object.shape,
		[object.x, height, object.y],
		[object.mx * shrink * pulse, object.my * shrink, object.mz * shrink * pulse],
		object.rot + sink * 7, tint, 1 - sink * 0.74, rare ? 0.34 : 0.08, sink * 1.42
	));
	if (rare && sink < 0.28 && renderQuality > 0.62) addAura(commands, object, time);
}

function addAura(commands, object, time) {
	const radius = object.r * (1.12 + Math.sin(time * 4 + Number(object.id)) * 0.04);
	const alpha = object.locked ? 0.42 : 0.22;
	commands.push(cmd('ring', [object.x, object.z + 2, object.y], [radius, 1, radius], time, object.color, alpha, 0.58));
}
