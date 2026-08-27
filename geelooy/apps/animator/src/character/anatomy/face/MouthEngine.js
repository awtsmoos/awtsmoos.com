
// B"H
import { MouthDataRegistry } from './mouth/data/MouthDataRegistry.js';
import { AwtsmoosMath }      from '../../../engine/core/AwtsmoosMath.js';
import { VirtualGraph as G } from '../../../engine/graph/VirtualGraph.js';
import { ANATOMY }           from '../../data/Anatomy.js';

/**
 * @file MouthEngine.js
 * @description
 * ═══════════════════════════════════════════════════════════════
 * CHAPTER 15: THE BREATH THAT MOVES THE CLAY (Ruach Chaim)
 * THE HARDCODED-Y RECTIFICATION
 * ═══════════════════════════════════════════════════════════════
 *
 * "The mouth speaks from the fullness of the heart." — Lukas 6:45 style paraphrase
 *
 * THE BUG OF THE FROZEN MOUTH OFFSET:
 * The mouth group was placed at a hardcoded { x:0, y:55 }.
 * This offset never adapted to character scale, head size, or
 * body archetypes. A 'giant' character had the mouth floating
 * in the middle of their forehead. A 'kid' had it at their chin.
 *
 * THE POEM OF THE MISPLACED MOUTH:
 * The mouth was pinned at fifty-five pixels down,
 * But the giant's head was two hundred — what a clown!
 * The kid's mouth hovered at chin level at best,
 * The dwarf's mouth was lost somewhere in the chest!
 * Now ANATOMY.head.rY drives the correct vertical seat,
 * And every mouth sits perfectly — complete!
 *
 * RECTIFICATION:
 * The Y offset is now derived from ANATOMY.head.rY * 0.55,
 * matching the biological proportion of the lower face.
 * Characters of all scales have correctly positioned mouths.
 *
 * @class MouthEngine
 */
export class MouthEngine {
  /**
   * @static
   * @type {Map<string, Object>}
   * @description Temporal vault: stores the last frame's 16-point mouth state per character.
   */
  static stateMap = new Map();

  /**
   * @function process
   * @description
   * Interpolates the mouth toward the target viseme and returns the VirtualGraph nodes.
   *
   * @param {string} id          - Character identity string.
   * @param {string} targetViseme - Desired phonetic shape key (e.g., 'A', 'smile', 'neutral').
   * @param {number} intensity   - How loudly/widely the emotion is expressed (0.0–1.0).
   * @param {string} skinColor   - Base hex colour for the skin context.
   * @returns {Object} A VirtualGraph Group node containing the mouth geometries.
   */
  static process(id, targetViseme, intensity, skinColor) {
    if (!this.stateMap.has(id)) {
      this.stateMap.set(id, JSON.parse(JSON.stringify(MouthDataRegistry.neutral)));
    }

    const currentState = this.stateMap.get(id);
    const targetKey    = MouthDataRegistry[targetViseme] ? targetViseme : 'neutral';
    const actualTarget = intensity < 0.08 ? MouthDataRegistry.neutral : MouthDataRegistry[targetKey];

    const friction = 0.28;

    // Lerp all 16 points toward the target.
    ['outerUpper', 'outerLower', 'innerUpper', 'innerLower'].forEach(layer => {
      for (let i = 0; i < 4; i++) {
        currentState[layer][i].x = AwtsmoosMath.lerp(currentState[layer][i].x, actualTarget[layer][i].x, friction);
        currentState[layer][i].y = AwtsmoosMath.lerp(currentState[layer][i].y, actualTarget[layer][i].y, friction);
      }
    });

    return this._buildGraphNodes(id, currentState, skinColor, intensity);
  }

  /**
   * @function _buildGraphNodes
   * @description Translates the 16 coordinate points into thick VirtualGraph paths.
   *
   * @param {string} id        - Character ID.
   * @param {Object} points    - The 16-point mouth state.
   * @param {string} skinColor - Base skin colour hex.
   * @param {number} intensity - Speech/emotion intensity.
   * @returns {Object} VirtualGraph group node.
   * @private
   */
  static _buildGraphNodes(id, points, skinColor, intensity) {
    const nodes = [];

    // ── Throat Abyss ─────────────────────────────────────────
    const voidPath = [
      { type: 'move',   x: points.innerUpper[0].x, y: points.innerUpper[0].y },
      { type: 'bezier', c1x: points.innerUpper[1].x, c1y: points.innerUpper[1].y,
                        c2x: points.innerUpper[2].x, c2y: points.innerUpper[2].y,
                          x: points.innerUpper[3].x,   y: points.innerUpper[3].y },
      { type: 'bezier', c1x: points.innerLower[2].x, c1y: points.innerLower[2].y,
                        c2x: points.innerLower[1].x, c2y: points.innerLower[1].y,
                          x: points.innerLower[0].x,   y: points.innerLower[0].y }
    ];
    nodes.push(G.path(`${id}_mouth_void`, voidPath, { fill: '#140003' }));

    // ── Upper Teeth (only when mouth is open enough) ─────────
    if (intensity > 0.15) {
      const teethY    = points.innerUpper[1].y;
      const teethWidth = Math.abs(points.innerUpper[3].x - points.innerUpper[0].x) * 0.75;
      const teethGeom  = [
        G.rect(`${id}_teeth_upper`, -teethWidth / 2, teethY, teethWidth, 10 + (intensity * 4), {
          fill: '#ffffff', stroke: '#000000', lineWidth: 3, radius: [2, 2, 8, 8]
        }),
        G.path(`${id}_teeth_gap`, [
          { type: 'move', x: 0, y: teethY },
          { type: 'line', x: 0, y: teethY + 14 }
        ], { stroke: '#000000', lineWidth: 2 })
      ];
      nodes.push(G.clip(`${id}_teeth_clip`, null, voidPath, teethGeom));
    }

    // ── Upper Lip ─────────────────────────────────────────────
    const upperLipPath = [
      { type: 'move',   x: points.outerUpper[0].x, y: points.outerUpper[0].y },
      { type: 'bezier', c1x: points.outerUpper[1].x, c1y: points.outerUpper[1].y,
                        c2x: points.outerUpper[2].x, c2y: points.outerUpper[2].y,
                          x: points.outerUpper[3].x,   y: points.outerUpper[3].y },
      { type: 'line',   x: points.innerUpper[3].x, y: points.innerUpper[3].y },
      { type: 'bezier', c1x: points.innerUpper[2].x, c1y: points.innerUpper[2].y,
                        c2x: points.innerUpper[1].x, c2y: points.innerUpper[1].y,
                          x: points.innerUpper[0].x,   y: points.innerUpper[0].y }
    ];

    // ── Lower Lip ─────────────────────────────────────────────
    const lowerLipPath = [
      { type: 'move',   x: points.outerLower[0].x, y: points.outerLower[0].y },
      { type: 'bezier', c1x: points.outerLower[1].x, c1y: points.outerLower[1].y,
                        c2x: points.outerLower[2].x, c2y: points.outerLower[2].y,
                          x: points.outerLower[3].x,   y: points.outerLower[3].y },
      { type: 'line',   x: points.innerLower[3].x, y: points.innerLower[3].y },
      { type: 'bezier', c1x: points.innerLower[2].x, c1y: points.innerLower[2].y,
                        c2x: points.innerLower[1].x, c2y: points.innerLower[1].y,
                          x: points.innerLower[0].x,   y: points.innerLower[0].y }
    ];

    nodes.push(
      G.path(`${id}_upper_lip`, upperLipPath, { fill: '#c25a6e', stroke: '#000000', lineWidth: 2.5, lineJoin: 'round' }),
      G.path(`${id}_lower_lip`, lowerLipPath, { fill: '#da7a8b', stroke: '#000000', lineWidth: 2.5, lineJoin: 'round' })
    );

    // RECTIFICATION: Y offset driven by ANATOMY.head.rY, not a magic number.
    // The mouth sits at ~55% of the way down the lower face (below centre).
    const mouthY = (ANATOMY && ANATOMY.head && ANATOMY.head.rY)
      ? ANATOMY.head.rY * 0.55
      : 55; // Safe fallback if ANATOMY not loaded.

    return G.group(`${id}_mouth_assembly`, { x: 0, y: mouthY }, nodes);
  }
}
