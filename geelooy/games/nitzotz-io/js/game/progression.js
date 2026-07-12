// B"H
import { evaluateAchievements } from '../progression/achievements.js';
import { recordRound } from '../progression/records.js';
import { WORLDS } from '../level.js';
import { nextModeId } from '../modes/catalog.js';
import { objectiveMet } from '../modes/rules.js';
import { saveGame } from '../save.js';
import { resetToLevel } from './reset.js';
import { playerRank } from './scoring.js';

export function start(world) {
	if (world.mode === 'playing') return;
	world.mode = 'playing';
	world.message = `${world.gameMode.name}: ${world.level.objective}.`;
	world.events.push(['start']);
}

export function togglePause(world) {
	if (world.mode === 'playing') world.mode = 'paused';
	else if (world.mode === 'paused') world.mode = 'playing';
}

export function restart(world) {
	resetToLevel(world, world.level.index, 'playing', 'The district has been regenerated.');
}

export function nextWorld(world) {
	selectWorld(world, Math.min(WORLDS.length - 1, world.level.index + 1));
}

export function selectWorld(world, index) {
	const selected = Math.max(0, Math.min(world.save.unlocked, index));
	world.save.currentLevel = selected;
	saveGame(world.save);
	resetToLevel(world, selected, 'ready', `Selected ${WORLDS[selected][0]}.`);
}

export function selectMode(world, id) {
	world.save.selectedMode = id;
	saveGame(world.save);
	resetToLevel(world, world.level.index, 'ready', 'Arena rules transformed.');
}

export function cycleMode(world) {
	selectMode(world, nextModeId(world.save.selectedMode));
}

export function upgrades(world) {
	world.rank = playerRank(world);
	world.objectiveMet = objectiveMet(world);
	world.bonusMet = bonusProgress(world) >= world.level.bonus.target;
}

export function bonusProgress(world) {
	return world.consumed[world.level.bonus.category] || 0;
}

export function finishRound(world) {
	if (world.mode !== 'playing') return;
	upgrades(world);
	if (!world.objectiveMet) return lose(world);
	world.stars = 1 + Number(world.rank <= 2) + Number(world.bonusMet);
	world.won = true;
	world.mode = 'won';
	persistResult(world, true);
	world.message = `${world.level.name}: rank ${world.rank}, bonus ${world.bonusMet ? 'complete' : 'missed'}, ${world.stars} stars.`;
	world.events.push(['win']);
}

export function lose(world) {
	world.lost = true;
	world.mode = 'lost';
	persistResult(world, false);
	world.message = `The round closed at ${Math.round(world.player.mass)} mass in ${world.gameMode.name}.`;
	world.events.push(['lose']);
}

function persistResult(world, won) {
	world.save.best = Math.max(world.save.best, world.score);
	world.save.bestMass = Math.max(world.save.bestMass || 0, world.player.mass);
	recordRound(world, won);
	evaluateAchievements(world);
	if (won) {
		world.save.stars[world.level.key] = Math.max(world.save.stars[world.level.key] || 0, world.stars);
		world.save.unlocked = Math.min(WORLDS.length - 1, Math.max(world.save.unlocked, world.level.index + 1));
	}
	saveGame(world.save);
}
