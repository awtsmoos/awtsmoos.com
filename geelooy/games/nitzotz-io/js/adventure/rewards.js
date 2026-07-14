// B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos settles a Shlichus once, only after a victorious round. Pending
 * perutot cannot be duplicated by repeated UI renders, saves, or finish calls.
 */
export function settleAdventureReward(world, won) {
	const adventure = world.adventure;
	if (!adventure?.active || adventure.settled) return emptySettlement();
	adventure.settled = true;
	const save = world.save;
	const records = save.adventureRecords;
	const previous = records[world.level.key] || {};
	const paid = won && adventure.complete ? adventure.pendingPerutot : 0;
	records[world.level.key] = {
		attempts: (previous.attempts || 0) + 1,
		completions: (previous.completions || 0) + Number(paid > 0),
		bestPerutot: Math.max(previous.bestPerutot || 0, paid),
		lastMode: world.gameMode.id
	};
	const stats = save.adventureStats;
	stats.attempts += 1;
	stats.completions += Number(paid > 0);
	stats.totalPerutot += paid;
	stats.bestPerutot = Math.max(stats.bestPerutot, paid);
	save.perutot += paid;
	return Object.freeze({
		perutot: paid,
		complete: adventure.complete,
		stages: adventure.stageCompletions
	});
}

function emptySettlement() {
	return Object.freeze({ perutot: 0, complete: false, stages: 0 });
}
