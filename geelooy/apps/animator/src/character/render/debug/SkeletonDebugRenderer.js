
// B"H
import { VirtualGraph as G } from '../../../engine/graph/VirtualGraph.js';

/**
 * @file SkeletonDebugRenderer.js
 * @description
 * ============================================================================
 * CHAPTER: THE BONES THAT SPOKE BEFORE THE SKIN
 * ============================================================================
 *
 * When legs vanish, arms detach, heads clip, or necks become pillars, beauty
 * must pause and bones must testify. This renderer marks every joint with a
 * blazing dot and every name with a label so anchors can be judged openly.
 *
 * @module SkeletonDebugRenderer
 */

/**
 * @class SkeletonDebugRenderer
 * @description
 * Builds debug graph nodes from skeleton joints.
 */
export class SkeletonDebugRenderer {
  /**
   * Builds skeleton debug nodes.
   *
   * @param {Object} skeleton - Skeleton joint map.
   * @returns {Object} Virtual graph group.
   */
  static build(skeleton = {}) {
    const children = [];
    const entries = Object.entries(skeleton);

    for (const [name, point] of entries) {
      if (!point || !Number.isFinite(point.x) || !Number.isFinite(point.y)) continue;

      children.push(G.circle('joint_' + name, {
        x: point.x,
        y: point.y,
        radius: 4,
        fill: '#ffdf3d',
        stroke: '#000000',
        lineWidth: 1
      }));

      children.push(G.text('joint_label_' + name, {
        x: point.x + 6,
        y: point.y - 6,
        text: name,
        fill: '#ffffff',
        font: '10px monospace'
      }));
    }

    return G.group('skeleton_debug', null, children);
  }
}
