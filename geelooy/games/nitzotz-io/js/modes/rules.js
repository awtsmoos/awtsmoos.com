// B"H
import { radiusForMass } from '../game/scoring.js';
import { modeAt } from './catalog.js';
import { dailyVariant } from './daily.js';

export function resolveGameMode(id = 'classic') {
	const selected = modeAt(id);
	if (!selected.daily) return selected;
	const variant = dailyVariant();
	return Object.freeze({ ...selected, ...variant, name: `${selected.name}: ${variant.name}` });
}

/** Apply a selected mode once to a freshly generated round. */
export function applyMode(world) {
	const gameMode = resolveGameMode(world.save.selectedMode);
	world.gameMode = gameMode;
	world.level.baseTargetMass ||= world.level.targetMass;
	world.level.targetMass = Math.round(world.level.baseTargetMass * gameMode.targetScale);
	world.level.target = world.level.targetMass;
	world.level.objective = modeObjective(world);
	world.player.mass *= gameMode.startMassScale;
	world.player.r = radiusForMass(world.player.mass);
	if (Number.isFinite(gameMode.rivalLimit)) world.rivals = world.rivals.slice(0, gameMode.rivalLimit);
	world.timeLeft = gameMode.untimed ? Infinity : world.level.time * gameMode.timeScale;
	world.rules = composeRules(gameMode);
	return gameMode;
}

export function composeRules(gameMode, eventRules = {}) {
	return {
		trafficSpeed: gameMode.trafficSpeed * (eventRules.trafficSpeed || 1),
		rivalSpeed: gameMode.rivalSpeed * (eventRules.rivalSpeed || 1),
		pedestrianSpeed: gameMode.pedestrianSpeed * (eventRules.pedestrianSpeed || 1),
		playerSpeed: gameMode.playerSpeed * (eventRules.playerSpeed || 1),
		scoreScale: gameMode.scoreScale * (eventRules.scoreScale || 1),
		captureMass: gameMode.captureMass * (eventRules.captureMass || 1),
		attractionScale: eventRules.attractionScale || 1,
		fragile: Boolean(gameMode.fragile || eventRules.fragile)
	};
}

export function tickMode(world, dt) {
	if (!world.gameMode.reverse) return;
	world.player.mass = Math.max(25, world.player.mass - dt * 2.2);
	world.player.r = radiusForMass(world.player.mass);
}

export function clockRuns(world) {
	return !world.gameMode.untimed;
}

export function objectiveMet(world) {
	const win = world.gameMode.win;
	if (win === 'boss') return world.director.boss.status === 'defeated';
	if (win === 'last') return world.rank === 1 && world.player.mass >= world.level.targetMass * 0.7;
	if (win === 'conquest') return world.telemetry.districtCount >= 4 && world.player.mass >= world.level.targetMass;
	if (win === 'reverse') return (world.consumed.landmark || 0) >= 3;
	return world.player.mass >= world.level.targetMass;
}

export function modeObjective(world) {
	const mode = world.gameMode || resolveGameMode(world.save.selectedMode);
	if (mode.win === 'boss') return 'Break three seals, then consume the awakened landmark';
	if (mode.win === 'last') return 'Reach first place before the clock closes';
	if (mode.win === 'conquest') return 'Reveal all four districts and reach the conquest mass';
	if (mode.win === 'reverse') return 'Consume three landmarks before your vessel contracts';
	if (mode.win === 'endless') return 'Climb through endless event and boss milestones';
	if (mode.win === 'zen') return 'Explore the living city without a clock';
	return `Reach ${world.level.targetMass} mass before time expires`;
}
