//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the stage story memory vessel in this instant, revealing
 * its focused js stage narrative service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
/**
 * B"H
 * Stage story memory.
 *
 * Chapter 170: the arena remembers cause and consequence. It counts rival hits,
 * recent stage interventions, dominance zones, and rare beats so the battle can
 * tell stories without scripts or heavy logic.
 */
export function createStageStoryMemory() {
	return {
		cooldown: 0,
		danger: new Set(),
		rivalHits: {},
		lastAttacker: {},
		zoneHeat: {},
		lastCounts: {
			itemsSpawned: 0,
			itemsPickedUp: 0,
			hazardsSpawned: 0,
			hazardHits: 0,
			objectiveSpawns: 0,
			objectiveClaims: 0
		},
		beats: 0,
		callouts: {}
	};
}

/**
 * Reveals the ensure stage story behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} state The state value entering this behavior.
 */
export function ensureStageStory(state) {
	state.story ||= createStageStoryMemory();
	return state.story;
}

/**
 * Reveals the can speak behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} story The story value entering this behavior.
 * @param {*} key The key value entering this behavior.
 * @param {*} cooldown The cooldown value entering this behavior.
 */
export function canSpeak(story, key, cooldown = 140) {
	story.callouts[key] = Math.max(0, (story.callouts[key] || 0) - 1);
	if (story.cooldown > 0 || story.callouts[key] > 0) return false;
	story.cooldown = 38;
	story.callouts[key] = cooldown;
	story.beats++;
	return true;
}

/**
 * Reveals the tick story cooldowns behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} story The story value entering this behavior.
 */
export function tickStoryCooldowns(story) {
	story.cooldown = Math.max(0, story.cooldown - 1);
	for (const key of Object.keys(story.callouts))
		story.callouts[key] = Math.max(0, story.callouts[key] - 1);
}

/**
 * Reveals the record rival hit behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} story The story value entering this behavior.
 * @param {*} attackerId The attacker id value entering this behavior.
 * @param {*} targetId The target id value entering this behavior.
 */
export function recordRivalHit(story, attackerId, targetId) {
	if (!attackerId || !targetId || attackerId === targetId)
		return { revenge: false, rivalry: false };
	const key = `${attackerId}->${targetId}`;
	const reverse = `${targetId}->${attackerId}`;
	story.rivalHits[key] = (story.rivalHits[key] || 0) + 1;
	const revenge = story.lastAttacker[attackerId] === targetId;
	const rivalry = (story.rivalHits[key] || 0) >= 3 && (story.rivalHits[reverse] || 0) >= 2;
	story.lastAttacker[targetId] = attackerId;
	return { revenge, rivalry };
}

/**
 * Reveals the record zone heat behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} story The story value entering this behavior.
 * @param {*} state The state value entering this behavior.
 * @param {*} x The x value entering this behavior.
 * @param {*} y The y value entering this behavior.
 * @param {*} weight The weight value entering this behavior.
 */
export function recordZoneHeat(story, state, x, y, weight = 1) {
	const width = Math.max(1, state.map.bounds.right - state.map.bounds.left);
	const key = Math.floor(((x - state.map.bounds.left) / width) * 5);
	const zone = (story.zoneHeat[key] ||= { heat: 0, x: 0, y: 0, samples: 0 });
	zone.heat += weight;
	zone.x += x;
	zone.y += y;
	zone.samples++;
	return { key, heat: zone.heat, x: zone.x / zone.samples, y: zone.y / zone.samples };
}

/**
 * Reveals the decay zone heat behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} story The story value entering this behavior.
 */
export function decayZoneHeat(story) {
	for (const key of Object.keys(story.zoneHeat)) {
		story.zoneHeat[key].heat *= 0.997;
		if (story.zoneHeat[key].heat < 0.7) delete story.zoneHeat[key];
	}
}
