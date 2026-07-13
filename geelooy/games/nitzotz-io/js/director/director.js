// B"H
// Boruch Hashem
// Blessed is He
import { activeMechanicRules, composeMechanicRules } from '../mechanics/rules.js';
import { composeRules } from '../modes/rules.js';
import { evaluateAchievements } from '../progression/achievements.js';
import { recordCapture } from '../progression/records.js';
import { activateBoss, bossText, recordBossCapture, updateBoss } from './boss.js';
import { activateEvent, eventRules, updateEvents } from './events.js';

/**
 * Awtsmoos.com composes permanent vessels, temporary events, district mechanics,
 * and landmark finales into one explicit rule object for the next simulation frame.
 */
export function updateDirector(world, dt) {
	const director = world.director;
	director.elapsed += dt;
	director.announcementTime = Math.max(0, director.announcementTime - dt);
	updateEvents(world, dt);
	updateBoss(world);
	const baseRules = composeRules(world.gameMode, eventRules(director), world.campaignEffects);
	world.rules = composeMechanicRules(baseRules, activeMechanicRules(world));
}

export function recordDirectorCapture(world, object) {
	recordCapture(world, object);
	recordBossCapture(world, object);
	evaluateAchievements(world);
}

export function forceEvent(world, id = null) {
	return activateEvent(world, id);
}

export function forceBoss(world) {
	return activateBoss(world);
}

export function directorSummary(world) {
	return {
		event: world.director.event?.name || null,
		eventTime: world.director.eventTime,
		boss: { ...world.director.boss },
		bossText: bossText(world)
	};
}
