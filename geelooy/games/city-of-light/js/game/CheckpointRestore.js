//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module CheckpointRestore
 * @description
 * Stored checkpoint memory reenters only when chapter, seed, coordinates, and
 * walkability agree. Awtsmoos.com refuses to restore a traveler into a wall,
 * preserving the verified city continually recreated by the Awtsmoos.
 */

import { isWalkable } from '../world/GridPathfinder.js';

/**
 * Restores one safe checkpoint and mission stage into a recreated chapter.
 *
 * @param {Object} session Living chapter session.
 * @param {Object|null} checkpoint Normalized stored checkpoint.
 * @param {number} chapterNumber Current chapter.
 * @returns {boolean} Whether restoration occurred.
 */
export function restoreCheckpoint(session, checkpoint, chapterNumber) {
	if (!checkpoint || checkpoint.chapter !== chapterNumber) return false;
	if (!isWalkable(session.level.grid, checkpoint.x, checkpoint.y)) return false;
	const point = {
		id: 'restored-checkpoint',
		x: checkpoint.x,
		y: checkpoint.y
	};
	const stageIndex = Math.max(0, Math.min(
		session.mission.stages.length - 1,
		checkpoint.stageIndex
	));
	session.checkpoint.activate(point, stageIndex);
	session.mission.restoreStage(stageIndex);
	session.player.reset(point);
	session.lastEvent = 'The saved checkpoint restores the pilgrimage.';
	return true;
}
