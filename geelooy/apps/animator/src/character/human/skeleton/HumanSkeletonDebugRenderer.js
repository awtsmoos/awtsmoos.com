
// B"H
import { VirtualGraph as G } from '../../../engine/graph/VirtualGraph.js';
import { HUMAN_BONE_PAIRS } from './HumanJointNames.js';

/**
 * @file HumanSkeletonDebugRenderer.js
 * @description
 * ============================================================================
 * CHAPTER: THE BONES THAT TESTIFIED IN GOLD AND CYAN
 * ============================================================================
 *
 * When a robe hides legs or a head slips away, debug bones reveal the truth.
 * Lines bind parent to child. Dots name the joints. The skeleton speaks before
 * clothing, face, and style can confuse the investigation.
 *
 * @module HumanSkeletonDebugRenderer
 */

/**
 * @class HumanSkeletonDebugRenderer
 * @description
 * Builds visual skeleton debug nodes.
 */
export class HumanSkeletonDebugRenderer {
  /**
   * Builds debug graph from a skeleton.
   *
   * @param {Object} skeleton - Skeleton joint map.
   * @param {string} id - Debug id prefix.
   * @returns {Object} VirtualGraph group.
   */
  static build(skeleton = {}, id = 'human_skeleton_debug') {
    const children = [];

    for (const [aName, bName] of HUMAN_BONE_PAIRS) {
      const a = skeleton[aName];
      const b = skeleton[bName];
      if (!this.point(a) || !this.point(b)) continue;
      children.push(G.path(id + '_bone_' + aName + '_' + bName, [
        { type: 'move', x: a.x, y: a.y },
        { type: 'line', x: b.x, y: b.y }
      ], {
        stroke: '#00f0ff',
        lineWidth: 2,
        lineCap: 'round'
      }));
    }

    for (const [name, point] of Object.entries(skeleton)) {
      if (!this.point(point)) continue;
      children.push(G.circle(id + '_joint_' + name, {
        x: point.x,
        y: point.y,
        radius: 4,
        fill: '#ffdf3d',
        stroke: '#000000',
        lineWidth: 1
      }));
      children.push(G.text(id + '_label_' + name, {
        x: point.x + 6,
        y: point.y - 6,
        text: name,
        fill: '#ffffff',
        font: '10px monospace'
      }));
    }

    return G.group(id, null, children);
  }

  /**
   * Checks if a value is a point.
   *
   * @param {Object} point - Possible point.
   * @returns {boolean} True when valid.
   */
  static point(point) {
    return Boolean(point && Number.isFinite(point.x) && Number.isFinite(point.y));
  }
}
