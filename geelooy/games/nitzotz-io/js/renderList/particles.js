// B"H
// Boruch Hashem
// Blessed is He
import { hsl } from '../math.js';
import { quality } from '../performance.js';
import { cmd } from './command.js';

/**
 * Sparks testify that vessels have returned to their source. This renderer walks
 * only the visible prefix, creating no temporary particle array in the heartbeat.
 */
export function particleCommands(commands, world) {
	const renderQuality = quality(world);
	const maximum = Math.min(world.particles.length, Math.floor(90 * renderQuality));
	for (let index = 0; index < maximum; index += 1) {
		addParticle(commands, world.particles[index], renderQuality);
	}
}

function addParticle(commands, particle, renderQuality) {
	const glow = 0.65 + particle.life * 0.45;
	commands.push(cmd(
		'sphere',
		[particle.x, particle.z, particle.y],
		[particle.r, particle.r, particle.r],
		0,
		hsl(particle.hue, 96, 72),
		Math.min(1, particle.life),
		glow
	));
	if (renderQuality <= 0.78 || particle.life <= 0.45) return;
	commands.push(cmd(
		'star',
		[
			particle.x - particle.vx * 0.025,
			particle.z - particle.vz * 0.018,
			particle.y - particle.vy * 0.025
		],
		[particle.r * 1.7, particle.r * 0.7, particle.r * 1.7],
		particle.life * 9,
		hsl(particle.hue + 28, 95, 62),
		particle.life * 0.32,
		glow
	));
}
