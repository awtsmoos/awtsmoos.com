
// B"H
import { VirtualGraph as G } from '../../engine/graph/VirtualGraph.js';

/**
 * @file BikeRenderer.js
 * @description
 * ============================================================================
 * CHAPTER: THE WHEEL THAT TURNED AND THE FRAME THAT HELD
 * ============================================================================
 *
 * The bike is rendered from skeleton, not guesswork: two wheels, a frame,
 * fork, seat, handlebar, crank, pedals, and chain line. It remains simple,
 * readable, and ready for richer art.
 *
 * @module BikeRenderer
 */

/**
 * @class BikeRenderer
 * @description
 * Builds bike VirtualGraph nodes.
 */
export class BikeRenderer {
  /**
   * Renders a bike.
   *
   * @param {Object} bike - Bike entity.
   * @param {Object} skeleton - Bike skeleton.
   * @returns {Object} VirtualGraph group.
   */
  static render(bike, skeleton) {
    const c = bike.colors || {};
    const id = bike.id || 'bike';
    const tire = c.tire || '#101114';
    const rim = c.rim || '#e5e7eb';
    const frame = c.frame || '#22d3ee';

    return G.group(id + '_bike_graph', null, [
      this.wheel(id + '_rear_wheel', skeleton.rearWheel, skeleton.wheelRadius, tire, rim),
      this.wheel(id + '_front_wheel', skeleton.frontWheel, skeleton.wheelRadius, tire, rim),
      this.line(id + '_chainstay', skeleton.rearWheel, skeleton.crankCenter, frame, 5),
      this.line(id + '_down_tube', skeleton.crankCenter, skeleton.frontForkTop, frame, 6),
      this.line(id + '_top_tube', skeleton.rearForkTop, skeleton.frontForkTop, frame, 6),
      this.line(id + '_seat_tube', skeleton.rearForkTop, skeleton.crankCenter, frame, 6),
      this.line(id + '_fork', skeleton.frontForkTop, skeleton.frontWheel, frame, 5),
      this.line(id + '_seat_post', skeleton.rearForkTop, skeleton.seat, frame, 4),
      this.line(id + '_handlebar_post', skeleton.frontForkTop, skeleton.handlebar, frame, 4),
      G.rect(id + '_seat', { x: skeleton.seat.x - 14, y: skeleton.seat.y - 4, width: 28, height: 8, fill: c.seat || '#111827', radius: 4 }),
      G.rect(id + '_handlebar', { x: skeleton.handlebar.x - 18, y: skeleton.handlebar.y - 3, width: 36, height: 6, fill: c.handlebar || '#d1d5db', radius: 3 }),
      G.circle(id + '_crank', { x: skeleton.crankCenter.x, y: skeleton.crankCenter.y, radius: 8, fill: frame, stroke: '#ffffff', lineWidth: 1 }),
      G.circle(id + '_left_pedal', { x: skeleton.leftPedal.x, y: skeleton.leftPedal.y, radius: 5, fill: '#facc15' }),
      G.circle(id + '_right_pedal', { x: skeleton.rightPedal.x, y: skeleton.rightPedal.y, radius: 5, fill: '#facc15' })
    ]);
  }

  /**
   * Builds wheel node.
   *
   * @param {string} id - Node id.
   * @param {Object} p - Wheel center.
   * @param {number} r - Radius.
   * @param {string} tire - Tire color.
   * @param {string} rim - Rim color.
   * @returns {Object} VirtualGraph group.
   */
  static wheel(id, p, r, tire, rim) {
    return G.group(id, null, [
      G.circle(id + '_tire', { x: p.x, y: p.y, radius: r, fill: 'transparent', stroke: tire, lineWidth: Math.max(5, r * 0.16) }),
      G.circle(id + '_rim', { x: p.x, y: p.y, radius: r * 0.68, fill: 'transparent', stroke: rim, lineWidth: 2 }),
      G.line(id + '_spoke_a', { x1: p.x - r * 0.65, y1: p.y, x2: p.x + r * 0.65, y2: p.y, stroke: rim, lineWidth: 1 }),
      G.line(id + '_spoke_b', { x1: p.x, y1: p.y - r * 0.65, x2: p.x, y2: p.y + r * 0.65, stroke: rim, lineWidth: 1 })
    ]);
  }

  /**
   * Builds a line primitive.
   *
   * @param {string} id - Node id.
   * @param {Object} a - First point.
   * @param {Object} b - Second point.
   * @param {string} stroke - Stroke color.
   * @param {number} width - Stroke width.
   * @returns {Object} Line node.
   */
  static line(id, a, b, stroke, width) {
    return G.line(id, { x1: a.x, y1: a.y, x2: b.x, y2: b.y, stroke, lineWidth: width, lineCap: 'round' });
  }
}
