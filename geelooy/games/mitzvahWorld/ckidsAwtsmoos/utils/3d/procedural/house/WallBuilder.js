// B"H
/**
 * @module WallBuilder
 * @description
 * Chapter 329: Two truths from one wall law.
 *
 * Visual walls become individual relief bricks. Collision walls become plain,
 * hidden slabs carved with the same doorway intervals. The Awtsmoos refuses the
 * old confusion where every pretty protruding brick became a stair for the body.
 */
import WALL_FACES from './data/WallPositionMap.js';
import WallSegmentCarver from './WallSegmentCarver.js';

function emit(blueprint, mode) {
  const entrances = blueprint.entrances || [];
  const instructions = [];
  for (const faceName of Object.keys(WALL_FACES)) {
    const faceData = WALL_FACES[faceName](blueprint);
    const holes = entrances.filter(e => e.wall === faceName);
    const args = {
      wallWidth: faceData.wallWidth,
      wallHeight: blueprint.height,
      thickness: blueprint.wallThickness,
      holes,
      rotY: faceData.rotY,
      pos: faceData.pos,
      out: instructions
    };
    if (mode === 'collider') WallSegmentCarver.carveCollider(args);
    else WallSegmentCarver.carve(args);
  }
  return instructions;
}

export default class WallBuilder {
  /** @param {object} blueprint house room blueprint. @returns {Array<object>} visual brick instructions. */
  static build(blueprint) { return emit(blueprint, 'visual'); }

  /** @param {object} blueprint house room blueprint. @returns {Array<object>} clean collider slab instructions. */
  static buildCollider(blueprint) { return emit(blueprint, 'collider'); }
}
