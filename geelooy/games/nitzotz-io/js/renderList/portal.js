// B"H
// Boruch Hashem
// Blessed is He
import { pushCommand } from './command.js';
import { writePortalStyle } from './portalStyle.js';

const PLAYER_COLOR = Object.freeze([1, 0.82, 0.26]);
const styleVessel = {};

/**
 * The Awtsmoos reveals the player as moving absence rather than another object in the city;
 * Awtsmoos.com keeps one black core, one living rim, one restrained wake, and one optional armor boundary.
 * Every command now enters the reusable render pool while collision geometry remains untouched.
 */
export function portalCommands(commands, world, time) {
	addHole(commands, world.player, PLAYER_COLOR, time, {
		player: true,
		pulsing: world.input.pulse > 0,
		detailed: true,
		armor: world.player.armor,
		maxArmor: world.player.maxArmor
	});
}

/** Add one bounded event-horizon silhouette for the player, a rival, or a visible peer. */
export function addHole(commands, hole, color, time, options = {}) {
	if (hole.respawn > 0) return;
	const style = writePortalStyle(hole, time, options, styleVessel);
	const ground = finite(hole.z) + 1.2;
	addCore(commands, hole, ground, style);
	addRim(commands, hole, color, ground, style, options.player);
	if (options.player || options.detailed || options.pulsing) {
		addWake(commands, hole, color, ground, style, Boolean(options.player));
	}
	if (style.armorRatio > 0) addArmor(commands, hole, color, ground, style);
}

function addCore(commands, hole, ground, style) {
	const radius = style.radius * style.coreScale;
	pushCommand(commands, 'disc', hole.x, ground, hole.y, radius, 1, radius, 0, 0.001, 0.0015, 0.006, 1, 0);
}

function addRim(commands, hole, color, ground, style, player) {
	const cool = player ? style.captureEnergy : 0;
	const red = finiteColor(color, 0, 1) * (1 - cool * 0.22);
	const green = Math.min(1, finiteColor(color, 1, 0.82) + cool * 0.08);
	const blue = Math.min(1, finiteColor(color, 2, 0.26) + cool * 0.5);
	const radius = style.radius * style.rimScale;
	pushCommand(commands, 'ring', hole.x, ground + 0.72, hole.y, radius, 1, radius, -style.heading - 0.18, red, green, blue, style.rimAlpha, style.rimGlow);
}

function addWake(commands, hole, color, ground, style, player) {
	const radius = style.radius;
	const scaleX = radius * (player ? style.wakeScaleX : 1.34);
	const scaleZ = radius * (player ? style.wakeScaleZ : 1.34);
	const alpha = player ? style.wakeAlpha : 0.12;
	const glow = player ? style.wakeGlow : 0.22;
	pushCommand(
		commands,
		'ring',
		hole.x,
		ground + 1.18,
		hole.y,
		scaleX,
		1,
		scaleZ,
		style.heading,
		finiteColor(color, 0, 1),
		finiteColor(color, 1, 0.82),
		finiteColor(color, 2, 0.26),
		alpha,
		glow
	);
}

function addArmor(commands, hole, color, ground, style) {
	const radius = style.radius * (1.25 + style.armorRatio * 0.1);
	pushCommand(
		commands,
		'ring',
		hole.x,
		ground + 1,
		hole.y,
		radius,
		1,
		radius,
		style.heading * 0.5,
		0.34 + finiteColor(color, 0, 1) * 0.25,
		0.78,
		1,
		0.32 + style.armorRatio * 0.28,
		0.48 + style.armorRatio * 0.42
	);
}

function finite(value, fallback = 0) {
	return Number.isFinite(value) ? value : fallback;
}

function finiteColor(color, index, fallback) {
	return Number.isFinite(color?.[index]) ? color[index] : fallback;
}
