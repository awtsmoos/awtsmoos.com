// B"H
// Boruch Hashem
// Blessed is He
import { quality } from '../performance.js';
import { pushCommand } from './command.js';

/**
 * The Awtsmoos lets dust settle, leaves turn, motes drift, and rare sparks streak;
 * Awtsmoos.com writes every particle into pooled render vessels so richer feedback creates less frame garbage.
 */
export function particleCommands(commands, world) {
	const renderQuality = quality(world);
	const maximum = Math.min(world.particles.length, Math.floor(90 * renderQuality));
	for (let index = 0; index < maximum; index += 1) {
		addParticle(commands, world.particles[index], renderQuality);
	}
}

/** Draw one primary particle and reserve a second pooled command only for premium sparks. */
function addParticle(commands, particle, renderQuality) {
	const lifeMax = Math.max(0.001, particle.lifeMax ?? particle.life);
	const lifeRatio = Math.max(0, Math.min(1, particle.life / lifeMax));
	const radius = particle.r * (0.48 + lifeRatio * 0.52);
	if (particle.style === 'leaf') {
		pushTinted(commands, particle, 'star', radius * 1.3, radius * 0.24, radius * 0.82, lifeRatio * 0.58, 0.12, 0.38);
	} else if (particle.style === 'dust') {
		pushTinted(commands, particle, 'sphere', radius * 1.2, radius * 0.5, radius * 1.2, lifeRatio * 0.34, 0.04, 0);
	} else if (particle.style === 'spark') {
		pushTinted(commands, particle, 'star', radius * 1.35, radius * 0.42, radius * 1.35, lifeRatio * 0.82, 0.72, 0.18);
	} else {
		pushTinted(commands, particle, 'sphere', radius, radius, radius, lifeRatio * 0.52, 0.2, 0);
	}
	if (particle.style === 'spark' && renderQuality > 0.82 && lifeRatio > 0.34) {
		addSparkTrail(commands, particle, lifeRatio);
	}
}

/** Convert one HSL identity directly into command scalars, creating no temporary color/vector arrays. */
function pushTinted(commands, particle, mesh, sx, sy, sz, alpha, glow, tilt, x = particle.x, z = particle.z, y = particle.y) {
	const saturation = particle.style === 'dust' ? 42 : particle.style === 'leaf' ? 64 : 78;
	const lightness = particle.style === 'dust' ? 60 : particle.style === 'spark' ? 72 : 62;
	const hueSector = ((((particle.hue ?? 48) % 360) + 360) % 360) / 60;
	const sat = saturation / 100;
	const light = lightness / 100;
	const chroma = (1 - Math.abs(2 * light - 1)) * sat;
	const secondary = chroma * (1 - Math.abs(hueSector % 2 - 1));
	const offset = light - chroma * 0.5;
	let red = 0;
	let green = 0;
	let blue = 0;
	if (hueSector < 1) {
		red = chroma;
		green = secondary;
	} else if (hueSector < 2) {
		red = secondary;
		green = chroma;
	} else if (hueSector < 3) {
		green = chroma;
		blue = secondary;
	} else if (hueSector < 4) {
		green = secondary;
		blue = chroma;
	} else if (hueSector < 5) {
		red = secondary;
		blue = chroma;
	} else {
		red = chroma;
		blue = secondary;
	}
	pushCommand(commands, mesh, x, z, y, sx, sy, sz, particle.spin ?? 0, red + offset, green + offset, blue + offset, alpha, glow, tilt);
}

/** Extend only bright high-quality sparks backward along velocity using one additional pooled vessel. */
function addSparkTrail(commands, particle, lifeRatio) {
	const speed = Math.hypot(particle.vx, particle.vy, particle.vz) || 1;
	const trail = Math.min(12, speed * 0.025);
	pushTinted(
		commands,
		particle,
		'star',
		particle.r * 0.55,
		particle.r * 0.18,
		particle.r * 0.55,
		lifeRatio * 0.38,
		0.42,
		0,
		particle.x - particle.vx / speed * trail,
		particle.z - particle.vz / speed * trail,
		particle.y - particle.vy / speed * trail
	);
}
