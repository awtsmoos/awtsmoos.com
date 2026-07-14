// B"H
// Boruch Hashem
// Blessed is He
import { radiusForMass } from '../game/scoring.js';
import { campaignEffects } from '../progression/effects.js';
import { talentEffects } from '../progression/talents.js';
import { modeById } from './catalog.js';

const MULTIPLIED_RULES = Object.freeze([
	'trafficSpeed',
	'trafficDensity',
	'rivalSpeed',
	'pedestrianSpeed',
	'playerSpeed',
	'scoreScale',
	'captureMass',
	'attractionScale'
]);

/**
 * The Awtsmoos composes mode, event, spark, and talent layers multiplicatively.
 * Fresh player mass remains intact unless a mode explicitly supplies a start mass.
 */
export function applyMode(world) {
	const mode = resolveGameMode(world.save.selectedMode);
	const campaign = campaignEffects(world.save);
	const talents = talentEffects(world.save);
	world.gameMode = mode;
	world.campaignEffects = campaign;
	world.talentEffects = talents;
	world.level.baseTargetMass ||= world.level.targetMass;
	world.level.targetMass = Math.max(80, Math.round(world.level.baseTargetMass * mode.targetScale));
	world.level.target = world.level.targetMass;
	world.level.objective = modeObjective(world);
	if (mode.startMass) world.player.mass = mode.startMass;
	world.player.r = radiusForMass(world.player.mass);
	world.player.maxArmor = talents.maxArmor;
	world.player.armor = talents.maxArmor;
	world.rivals = world.rivals.slice(0, mode.rivals ?? world.rivals.length);
	world.timeLeft = mode.untimed ? Infinity : world.level.time * mode.timeScale;
	world.rules = composeRules(mode, campaign, talents);
	return mode;
}

export function resolveGameMode(id) {
	return modeById(id);
}

/** Compose any number of bounded rule layers after the immutable mode defaults. */
export function composeRules(mode, ...layers) {
	const output = {
		trafficSpeed: mode.trafficSpeed,
		trafficDensity: mode.trafficDensity,
		rivalSpeed: mode.rivalSpeed,
		pedestrianSpeed: mode.pedestrianSpeed,
		playerSpeed: mode.playerSpeed,
		scoreScale: mode.scoreScale,
		captureMass: mode.captureMass,
		attractionScale: 1,
		massDecay: mode.massDecay,
		fragile: Boolean(mode.fragile)
	};
	for (const layer of layers) multiplyLayer(output, layer);
	return Object.freeze(output);
}

/** Apply finite mode-specific decay without changing movement or collision laws. */
export function tickMode(world, dt) {
	const decay = world.rules.massDecay || 0;
	if (decay <= 0) return;
	world.player.mass = Math.max(25, world.player.mass - dt * decay);
	world.player.r = radiusForMass(world.player.mass);
}

export function clockRuns(world) {
	return !world.gameMode.untimed;
}

export function objectiveMet(world) {
	const win = world.gameMode.win;
	if (win === 'record') return false;
	if (win === 'boss') return world.director.boss.status === 'defeated';
	if (win === 'last') return world.rank === 1 && world.player.mass >= world.level.targetMass * 0.7;
	if (win === 'conquest') return world.telemetry.districtCount >= 4 && world.player.mass >= world.level.targetMass;
	if (win === 'reverse') return (world.consumed.landmark || 0) >= 3;
	if (win === 'shlichus') return Boolean(world.adventure?.complete);
	return world.player.mass >= world.level.targetMass;
}

export function modeObjective(world) {
	const mode = world.gameMode || resolveGameMode(world.save.selectedMode);
	if (mode.win === 'record') return 'Reveal without limit and establish a persistent record';
	if (mode.win === 'boss') return 'Break the active district seal';
	if (mode.win === 'last') return 'Reach first place before the clock closes';
	if (mode.win === 'conquest') return 'Reveal all four city quadrants and reach conquest mass';
	if (mode.win === 'reverse') return 'Consume three landmarks before your vessel contracts';
	if (mode.win === 'shlichus') return 'Complete all three stages of the seeded Shlichus';
	return `Reach mass ${world.level.targetMass}`;
}

function multiplyLayer(output, layer = {}) {
	for (const key of MULTIPLIED_RULES) {
		if (Number.isFinite(layer[key])) output[key] *= layer[key];
	}
	output.fragile = Boolean(output.fragile || layer.fragile);
}
