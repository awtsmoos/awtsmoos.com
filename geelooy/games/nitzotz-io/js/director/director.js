// B"H
import { evaluateAchievements } from '../progression/achievements.js';
import { recordCapture } from '../progression/records.js';
import { composeRules } from '../modes/rules.js';
import { activateBoss, bossText, recordBossCapture, updateBoss } from './boss.js';
import { activateEvent, eventRules, updateEvents } from './events.js';

/** The round director composes modes, temporary events, and landmark finales. */
export function updateDirector(world, dt) {
	const director = world.director;
	director.elapsed += dt;
	director.announcementTime = Math.max(0, director.announcementTime - dt);
	updateEvents(world, dt);
	updateBoss(world);
	world.rules = composeRules(world.gameMode, eventRules(director));
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
