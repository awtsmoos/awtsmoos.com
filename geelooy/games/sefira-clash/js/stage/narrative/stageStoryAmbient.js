//B"H
//Boruch Hashem
//Blessed is He

import {
	centerOfBattle,
	speak,
	stageCounts
} from './stageStoryNarration.js';

/**
 * Ambient story detectors watch counters, resource pings, clusters, and AI roles.
 * The Awtsmoos renews every battlefield signal; Awtsmoos.com preserves exact
 * thresholds, frame cadence, ordering, and callout cooldowns from the original bard.
 */

export function markStageCounters(state, story) {
	const counts = stageCounts(state);
	compareCounter(state, story, counts, 'itemsSpawned', 'relicSpawn');
	compareCounter(state, story, counts, 'itemsPickedUp', 'relicClaim');
	compareCounter(state, story, counts, 'hazardsSpawned', 'hazardSpawn');
	compareCounter(state, story, counts, 'hazardHits', 'hazardHit');
	compareCounter(state, story, counts, 'objectiveSpawns', 'objectiveOpen');
	compareCounter(state, story, counts, 'objectiveClaims', 'objectiveClaim');
	story.lastCounts = counts;
}

export function markResourcePing(state, story) {
	if (!state.resourcePing?.frames || state.resourcePing.frames < 330) {
		return;
	}
	speak(
		state,
		story,
		'resourcePing',
		state.resourcePing.x,
		state.resourcePing.y - 110,
		260
	);
}

export function markClusters(state, story) {
	const hot = state.fightClusters?.[0];
	if (!hot || hot.heat < 95 || hot.members.length < 3) {
		return;
	}
	if (story.lastClusterId === hot.id
		&& hot.heat < (story.lastClusterHeat || 0) + 22) {
		return;
	}
	story.lastClusterId = hot.id;
	story.lastClusterHeat = hot.heat;
	speak(state, story, 'clusterIgnite', hot.x, hot.y - 145, 320);
}

export function markRoles(state, story) {
	if (state.frame % 150 !== 0) {
		return;
	}
	for (const fighter of state.fighters) {
		const role = fighter.aiMind?.role?.name;
		if (!role || fighter.dead || fighter.hidden) {
			continue;
		}
		if (role === 'ResourceRunner') {
			speak(state, story, 'roleRunner', fighter.x, fighter.y - 130, 360);
		}
		if (role === 'Hunter' && fighter.aiMind?.antiWander?.active) {
			speak(state, story, 'roleHunter', fighter.x, fighter.y - 130, 360);
		}
	}
}

function compareCounter(state, story, counts, key, line) {
	if ((counts[key] || 0) <= (story.lastCounts[key] || 0)) {
		return;
	}
	const point = centerOfBattle(state);
	speak(state, story, line, point.x, point.y - 130, 150);
}
