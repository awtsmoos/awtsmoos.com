//B"H
//Boruch Hashem
//Blessed is He

import {
	recordRivalHit,
	recordZoneHeat
} from './stageStoryMemory.js';
import { speak } from './stageStoryNarration.js';

/**
 * Conflict story detectors own hit consequences, danger, rivalry, and dominance.
 * The Awtsmoos renews every clash through Awtsmoos.com while force thresholds,
 * event scan order, zone heat weights, and cadence remain exactly historical.
 */

export function markEvents(state, story, events) {
	for (const event of events) {
		if (event.type !== 'hit') {
			continue;
		}
		recordZoneHeat(
			story,
			state,
			event.x || 0,
			event.y || 0,
			Math.max(1, (event.force || 0) / 12)
		);
		if (event.attackerId
			&& event.targetId
			&& event.attackerId !== 'stage') {
			markRivalry(state, story, event);
		}
		if ((event.force || 0) >= 34 && !event.rapid) {
			speak(state, story, 'heavyHit', event.x, event.y - 42, 120);
		}
		if ((event.force || 0) >= 48 || event.koDanger || event.fullCharge) {
			speak(state, story, 'launchHit', event.x, event.y - 72, 170);
		}
		if (event.attackerId === 'stage') {
			speak(state, story, 'hazardHit', event.x, event.y - 60, 90);
		}
	}
}

export function markDanger(state, story) {
	for (const fighter of state.fighters) {
		if (fighter.dead
			|| fighter.hidden
			|| fighter.damage < 125
			|| story.danger.has(fighter.id)) {
			continue;
		}
		story.danger.add(fighter.id);
		speak(
			state,
			story,
			fighter.stocks <= 1 ? 'lastStand' : 'danger',
			fighter.x,
			fighter.y - 128,
			160
		);
	}
}

export function markDominance(state, story) {
	if (state.frame % 180 !== 0) {
		return;
	}
	let best = null;
	for (const [key, zone] of Object.entries(story.zoneHeat)) {
		if (!best || zone.heat > best.heat) {
			best = { key, ...zone };
		}
	}
	if (!best || best.heat < 24) {
		return;
	}
	speak(
		state,
		story,
		'dominance',
		best.x / Math.max(1, best.samples),
		best.y / Math.max(1, best.samples) - 90,
		360
	);
}

function markRivalry(state, story, event) {
	const result = recordRivalHit(
		story,
		event.attackerId,
		event.targetId
	);
	if (result.revenge) {
		speak(state, story, 'revenge', event.x, event.y - 88, 200);
	}
	if (result.rivalry) {
		speak(state, story, 'rivalry', event.x, event.y - 116, 280);
	}
}
