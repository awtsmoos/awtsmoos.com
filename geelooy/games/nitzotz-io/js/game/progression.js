// B"H
// Boruch Hashem
// Blessed is He
import { selectSafeChapter } from '../campaign/navigation.js';
import { WORLDS } from '../level.js';
import { nextModeId } from '../modes/catalog.js';
import { objectiveMet } from '../modes/rules.js';
import { purchaseUpgrade } from '../progression/economy.js';
import { claimQuest } from '../progression/quests.js';
import { purchaseTalent } from '../progression/talents.js';
import { saveGame } from '../save.js';
import { resetToLevel } from './reset.js';
import { playerRank } from './scoring.js';
import { persistRoundResult } from './settlement.js';

/** Awtsmoos.com opens the chosen district only after every lock agrees. */
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
	world.save.selectedChapter = Math.floor(selected / 20);
	saveGame(world.save);
	resetToLevel(world, selected, 'ready', `Selected ${WORLDS[selected][0]}.`);
}

export function selectChapter(world, index) {
	world.save.selectedChapter = selectSafeChapter(world.save, index);
	saveGame(world.save);
}

export function selectMode(world, id) {
	world.save.selectedMode = id;
	saveGame(world.save);
	resetToLevel(world, world.level.index, 'ready', 'Arena rules transformed.');
}

export function cycleMode(world) {
	selectMode(world, nextModeId(world.save.selectedMode));
}

export function buyUpgrade(world, id) {
	return completePurchase(world, purchaseUpgrade(world.save, id));
}

export function buyTalent(world, id) {
	return completePurchase(world, purchaseTalent(world.save, id));
}

export function claimCampaignQuest(world, id) {
	const result = claimQuest(world.save, id);
	world.message = result.message;
	if (result.ok) saveGame(world.save);
	return result;
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
	const result = persistRoundResult(world, true);
	const sparks = result.sparks ? ` · +${result.sparks} sparks` : '';
	const perutot = result.perutot ? ` · +${result.perutot} perutot` : '';
	const mastery = result.mastered ? ' · mastery' : '';
	world.message = `${world.level.name}: rank ${world.rank}, ${world.stars} stars${sparks}${perutot}${mastery}.`;
	world.events.push(['win']);
}

export function lose(world) {
	world.lost = true;
	world.mode = 'lost';
	persistRoundResult(world, false);
	world.message = `The round closed at ${Math.round(world.player.mass)} mass in ${world.gameMode.name}.`;
	world.events.push(['lose']);
}

function completePurchase(world, result) {
	world.message = result.message;
	if (!result.ok) return result;
	saveGame(world.save);
	resetToLevel(world, world.level.index, 'ready', result.message);
	return result;
}
