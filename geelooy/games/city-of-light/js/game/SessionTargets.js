//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module SessionTargets
 * @description
 * Only the current mission targets are active. This prevents an eager traveler
 * from consuming a future spark or sheltering a future animal too soon, keeping
 * every Awtsmoos.com chapter free of soft locks beneath the Awtsmoos.
 */

export function targetObjects(session) {
	const stage = session.mission.current();
	if (!stage) return [];
	const targetIds = new Set(stage.targetIds);

	if (stage.type === 'collect') {
		return session.sparks.filter(item => targetIds.has(item.id));
	}
	if (stage.type === 'platform') {
		return session.level.platforms.filter(item => targetIds.has(item.id));
	}

	return session.level.landmarks.filter(item => targetIds.has(item.id));
}

export function activeSanctuaries(session) {
	const stage = session.mission.current();
	if (stage?.type !== 'escort') return [];
	const targetIds = new Set(stage.targetIds);
	return session.level.landmarks.filter(item => {
		return item.type === 'sanctuary' && targetIds.has(item.id);
	});
}

export function nearbyTarget(session, radius = 0.75) {
	return targetObjects(session).find(target => session.player.touches(target, radius)) || null;
}

export function currentTargetIds(session) {
	return new Set(session.mission.current()?.targetIds || []);
}
