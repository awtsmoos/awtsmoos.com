
// B"H
import { VirtualGraph as G } from '../../../engine/graph/VirtualGraph.js';
import { PerspectiveEngine } from './perspective/PerspectiveEngine.js';
import { VisualDebugLog } from '../../factory/diagnostics/VisualDebugLog.js';

/**
 * @file Neck.js
 * @description
 * ═══════════════════════════════════════════════════════════════
 * CHAPTER: THE FINAL GATE AGAINST THE TAN PILLAR
 * ═══════════════════════════════════════════════════════════════
 *
 * This module keeps the rich original head pipeline alive, but it refuses the
 * one fatal geometry: a neck span taller than a neck. If any old caller sends
 * torso-to-head coordinates, the span is clamped and the log says so in one
 * short text-only line when visual debugging is enabled.
 *
 * The Awtsmoos creates every body part from nothing. Each part receives its
 * measure. A neck that becomes a pole has rebelled against its own measure.
 *
 * @class Neck
 */
export class Neck {
  /**
   * Builds a bounded neck polygon.
   *
   * @param {Object} params - Neck parameters.
   * @param {number} params.startX - Bottom x.
   * @param {number} params.startY - Bottom y.
   * @param {number} params.endX - Top x.
   * @param {number} params.endY - Top y.
   * @param {string} params.skinColor - Skin color.
   * @param {string} params.view - View name.
   * @param {boolean} params.flipX - Flip state.
   * @param {number} params.widthTop - Top width.
   * @param {number} params.widthBottom - Bottom width.
   * @param {number} params.maxHeight - Maximum neck height.
   * @returns {Object} VirtualGraph group.
   */
  static build(params = {}) {
    const p = this.safe(params);
    const profile = PerspectiveEngine.getProfile(p.view, p.flipX);

    const points = [
      { type: 'move', x: p.startX - p.widthBottom / 2, y: p.startY },
      { type: 'line', x: p.startX + p.widthBottom / 2, y: p.startY },
      { type: 'line', x: p.endX + p.widthTop / 2, y: p.endY },
      { type: 'quad', cx: (p.startX + p.endX) / 2, cy: p.endY + 6, x: p.endX - p.widthTop / 2, y: p.endY },
      { type: 'line', x: p.startX - p.widthBottom / 2, y: p.startY }
    ];

    return G.group('neck_vessel', null, [
      G.path('neck_skin', points, {
        fill: p.skinColor,
        stroke: '#000',
        lineWidth: 2,
        lineJoin: 'round'
      }),
      profile.type !== 'front'
        ? G.path('neck_side_fold', [
            { type: 'move', x: p.endX + profile.dir * p.widthTop * 0.22, y: p.endY + 3 },
            { type: 'line', x: p.startX + profile.dir * p.widthBottom * 0.22, y: p.startY - 2 }
          ], { stroke: '#00000033', lineWidth: 2, lineCap: 'round' })
        : null
    ]);
  }

  /**
   * Sanitizes neck geometry.
   *
   * @param {Object} raw - Raw parameters.
   * @returns {Object} Safe neck parameters.
   */
  static safe(raw) {
    const endX = this.num(raw.endX, 0);
    const endY = this.num(raw.endY, -220);
    let startX = this.num(raw.startX, endX);
    let startY = this.num(raw.startY, endY + 24);

    const maxHeight = Math.max(14, Math.min(38, this.num(raw.maxHeight, 30)));
    const span = Math.abs(startY - endY);

    if (span > maxHeight) {
      VisualDebugLog.warn('neck-clamp', `neck clamp rawSpan=${Math.round(span)} max=${Math.round(maxHeight)}`);
      startX = endX + Math.max(-8, Math.min(8, startX - endX));
      startY = endY + maxHeight;
    }

    return {
      startX,
      startY,
      endX,
      endY,
      skinColor: raw.skinColor || '#f2c1a2',
      view: raw.view || 'front',
      flipX: Boolean(raw.flipX),
      widthTop: Math.max(12, Math.min(32, this.num(raw.widthTop, 20))),
      widthBottom: Math.max(14, Math.min(38, this.num(raw.widthBottom, 27)))
    };
  }

  /**
   * Returns finite number or fallback.
   *
   * @param {*} value - Candidate number.
   * @param {number} fallback - Fallback number.
   * @returns {number} Safe number.
   */
  static num(value, fallback) {
    return Number.isFinite(value) ? value : fallback;
  }
}
