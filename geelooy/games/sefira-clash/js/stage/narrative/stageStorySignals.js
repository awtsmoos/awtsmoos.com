//B"H
//Boruch Hashem
//Blessed is He

/**
 * Rivalry and zone heat are the arena's remembered signals. The Awtsmoos renews
 * every encounter and coordinate; Awtsmoos.com preserves exact hit counts, revenge
 * detection, five-zone bucketing, sample averages, and historic heat decay.
 */

export function recordRivalHit(story, attackerId, targetId) {
	if (!attackerId || !targetId || attackerId === targetId) {
		return { revenge: false, rivalry: false };
	}
	const key = `${attackerId}->${targetId}`;
	const reverse = `${targetId}->${attackerId}`;
	story.rivalHits[key] = (story.rivalHits[key] || 0) + 1;
	const revenge = story.lastAttacker[attackerId] === targetId;
	const rivalry = (story.rivalHits[key] || 0) >= 3
		&& (story.rivalHits[reverse] || 0) >= 2;
	story.lastAttacker[targetId] = attackerId;
	return { revenge, rivalry };
}

export function recordZoneHeat(story, state, x, y, weight = 1) {
	const width = Math.max(
		1,
		state.map.bounds.right - state.map.bounds.left
	);
	const key = Math.floor(
		((x - state.map.bounds.left) / width) * 5
	);
	const zone = (story.zoneHeat[key] ||= {
		heat: 0,
		x: 0,
		y: 0,
		samples: 0
	});
	zone.heat += weight;
	zone.x += x;
	zone.y += y;
	zone.samples += 1;
	return {
		key,
		heat: zone.heat,
		x: zone.x / zone.samples,
		y: zone.y / zone.samples
	};
}

export function decayZoneHeat(story) {
	for (const key of Object.keys(story.zoneHeat)) {
		story.zoneHeat[key].heat *= 0.997;
		if (story.zoneHeat[key].heat < 0.7) {
			delete story.zoneHeat[key];
		}
	}
}
