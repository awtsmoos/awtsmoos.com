//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module MissionPlanner
 * @description
 * Authored stages become explicit references to generated targets. Nothing is
 * resolved by vague proximity or guessed counts: Awtsmoos.com knows which shrine,
 * platform, animal sanctuary, or beacon fulfills each promise of the Awtsmoos.
 */

const LANDMARK_TYPES = Object.freeze({
	awaken: 'shrine',
	bridge: 'bridgeStone',
	sequence: 'echo',
	checkpoint: 'checkpoint',
	exit: 'exit'
});

function targetsOfType(landmarks, type) {
	return landmarks.filter(item => item.type === type);
}

function takeTargets(collection, count, cursors, cursorKey) {
	const start = cursors.get(cursorKey) || 0;
	const targets = collection.slice(start, start + count);
	cursors.set(cursorKey, start + count);
	return targets.map(target => target.id);
}

/**
 * Binds every campaign stage to concrete generated identifiers.
 *
 * @param {Object} chapter Authored chapter definition.
 * @param {Object} world Generated landmarks, sparks, and platforms.
 * @returns {Object[]} Fully bound mission stages.
 */
export function planMission(chapter, world) {
	const cursors = new Map();

	return chapter.stages.map(stage => {
		let targetIds = [];

		if (stage.type === 'collect') {
			targetIds = takeTargets(world.sparks, stage.count, cursors, 'spark');
		} else if (stage.type === 'platform') {
			targetIds = takeTargets(world.platforms, stage.count, cursors, 'platform');
		} else if (stage.type === 'escort') {
			const sanctuaries = targetsOfType(world.landmarks, 'sanctuary');
			targetIds = takeTargets(sanctuaries, 1, cursors, 'sanctuary');
		} else {
			const landmarkType = LANDMARK_TYPES[stage.type];
			const targets = targetsOfType(world.landmarks, landmarkType);
			targetIds = takeTargets(targets, stage.count, cursors, landmarkType);
		}

		return {
			...stage,
			targetIds,
			requiredCount: stage.count,
			completedCount: 0
		};
	});
}

export function missionTargetIds(mission) {
	return new Set(mission.flatMap(stage => stage.targetIds));
}
