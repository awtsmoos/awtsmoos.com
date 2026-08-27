
// B"H

/**
 * @file SceneSpatialSanitizer.js
 * @description
 * ═══════════════════════════════════════════════════════════════
 * CHAPTER: THE BOUNDARY THAT SAVES THE FACE
 * ═══════════════════════════════════════════════════════════════
 *
 * Trees, buildings, props, and characters were allowed to occupy the same
 * visual lane. A trunk could stand directly over a person and the renderer
 * would obediently draw the disaster.
 *
 * This module is pure data surgery. It can be used before rendering to move
 * background foliage away from character bounds while preserving the scene's
 * overall design.
 *
 * The Awtsmoos sustains stone, tree, person, and pixel. Their unity does not
 * mean visual collision. Unity means each created thing serves its place.
 *
 * @class SceneSpatialSanitizer
 */
export class SceneSpatialSanitizer {
  /**
   * Returns a sanitized copy of a scene object.
   *
   * @param {Object} scene - Scene data.
   * @param {Object} characters - Character map.
   * @returns {Object} Scene copy with foliage moved out of character lanes.
   */
  static sanitize(scene, characters = {}) {
    if (!scene) return scene;

    const bounds = this.characterBounds(characters);
    const clearance = scene.composition?.propClearance || 160;

    return {
      ...scene,
      foliage: (scene.foliage || []).map(item => this.moveIfColliding(item, bounds, clearance)),
      props: (scene.props || []).map(item => this.moveIfColliding(item, bounds, clearance))
    };
  }

  /**
   * Calculates a combined horizontal character lane.
   *
   * @param {Object} characters - Character map.
   * @returns {Object} minX and maxX.
   */
  static characterBounds(characters) {
    const xs = Object.values(characters)
      .map(char => char?.position?.x)
      .filter(Number.isFinite);

    if (!xs.length) return { minX: -340, maxX: 340 };
    return {
      minX: Math.min(...xs) - 120,
      maxX: Math.max(...xs) + 120
    };
  }

  /**
   * Moves an item away from character bounds when needed.
   *
   * @param {Object} item - Scene item.
   * @param {Object} bounds - Character horizontal bounds.
   * @param {number} clearance - Required clearance.
   * @returns {Object} Sanitized item.
   */
  static moveIfColliding(item, bounds, clearance) {
    if (!item || !Number.isFinite(item.x)) return item;

    const radius = Number.isFinite(item.size) ? item.size * 0.25 : 70;
    const left = item.x - radius;
    const right = item.x + radius;
    const collides = right > bounds.minX - clearance && left < bounds.maxX + clearance;

    if (!collides) return item;

    const targetX = item.x < 0 ? bounds.minX - clearance - radius : bounds.maxX + clearance + radius;
    return { ...item, x: targetX, depth: Number.isFinite(item.depth) ? item.depth : -12 };
  }
}
