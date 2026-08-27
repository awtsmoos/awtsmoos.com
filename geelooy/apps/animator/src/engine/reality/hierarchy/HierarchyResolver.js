
// B"H
import { WorldMatrixMath } from './WorldMatrixMath.js';

/**
 * @file HierarchyResolver.js
 * @description
 * ═══════════════════════════════════════════════════════════════
 * CHAPTER 3: THE ASCENT TO THE SOURCE (Aliyat HaMekor)
 * ═══════════════════════════════════════════════════════════════
 * 
 * To know where a spark is, you must know what sustains it.
 * This class recursively climbs the `parent` and `mount` references 
 * of any entity, computing its absolute World coordinates.
 * 
 * @class HierarchyResolver
 */

export class HierarchyResolver {
  static resolve(entity, state, depth = 0) {
    if (!entity) return { x: 0, y: 0, rotation: 0, scaleX: 1, scaleY: 1 };
    
    if (depth > 10) {
      console.warn('B"H - Hierarchy Paradox Detected! Infinity loop severed.');
      return this._getBaseTransform(entity);
    }

    const localTransform = this._getBaseTransform(entity);

    if (!entity.parentId && !entity.mountedTo) {
      return localTransform;
    }

    const targetId = entity.parentId || entity.mountedTo;
    const parentEntity = this._findEntityById(targetId, state);

    if (!parentEntity) {
      return localTransform; 
    }

    const parentWorldTransform = this.resolve(parentEntity, state, depth + 1);

    if (entity.mountedTo) {
        localTransform.y += entity.mountOffsetY || -60; 
        localTransform.x += entity.mountOffsetX || 0;
    }

    return WorldMatrixMath.combine(localTransform, parentWorldTransform);
  }

  static _getBaseTransform(entity) {
    // B"H - Pure spatial math. We do NOT bake visual mirroring (flipX) into 
    // the mathematical grid! The Soul Assembler handles visual flipping safely.
    if (entity.position) {
      return {
        x: entity.position.x || 0,
        y: entity.position.y || 0,
        rotation: entity.rotation || 0,
        scaleX: entity.position.scale ?? 1,
        scaleY: Math.abs(entity.position.scale ?? 1)
      };
    }
    return {
      x: entity.x || 0,
      y: entity.y || 0,
      rotation: entity.rotation || 0,
      scaleX: Math.abs(entity.scaleX ?? entity.scale ?? 1),
      scaleY: Math.abs(entity.scaleY ?? entity.scale ?? 1)
    };
  }

  static _findEntityById(id, state) {
    const chars = state.get('characters') || {};
    if (chars[id]) return chars[id];

    const scene = state.get('scene') || {};
    const domains = ['props', 'foliage', 'buildings'];
    for (const domain of domains) {
      if (scene[domain]) {
        const found = scene[domain].find(e => e.id === id);
        if (found) return found;
      }
    }
    return null;
  }
}
