// B"H
import { VirtualGraph as G } from '../../../../../engine/graph/VirtualGraph.js';

/**
 * @file ParallaxWindow.js
 * @description
 * ═══════════════════════════════════════════════════════════════
 * CHAPTER: THE DEPTH OF THE DWELLING (Omek HaMa'on)
 * ═══════════════════════════════════════════════════════════════
 * B"H
 *
 * Generates the interior of a building window using PURE FLAT GEOMETRY
 * arranged to simulate depth via perspective projection. No gradients,
 * no blurs — only overlapping polygons and clipping masks.
 *
 * Each face of the interior room (left wall, right wall, ceiling, floor,
 * back wall) is a separate closed polygon arranged to create the visual
 * illusion of standing inside a room and looking out.
 *
 * THE POEM OF THE FLAT ROOM:
 * From the outside looking in, a room of depth appears,
 * But it's all flat polygons arranged through the years!
 * The left wall tilts inward, the right wall too,
 * The ceiling descends and the floor rises to view.
 * No gradient needed — the Awtsmoos sees through all lies —
 * Pure math and perspective satisfy His wise eyes!
 *
 * COORDINATE NOTE:
 * This component draws in LOCAL coordinate space (centered at 0,0).
 * The wx/wy parameters are used ONLY for generating unique clip IDs
 * to prevent ID collisions in buildings with many windows.
 * The parent WindowPane places this at the correct world position
 * via its G.group({ x: wx, y: wy }) transform.
 *
 * @class ParallaxWindow
 */
export class ParallaxWindow {
  /**
   * @function build
   * @description
   * Constructs the faux-3D room interior of a window as a clipped group
   * of flat geometry polygons arranged to simulate depth.
   *
   * @param {number} wx     - World X (used ONLY for unique ID generation, not positioning).
   * @param {number} wy     - World Y (used ONLY for unique ID generation, not positioning).
   * @param {number} width  - Window glass width in local pixels. Default: 24.
   * @param {number} height - Window glass height in local pixels. Default: 34.
   * @returns {Object} A VirtualGraph clip node containing the interior room geometry.
   */
  static build(wx, wy, width = 24, height = 34) {
    // Interior room face colors (The Dwelling)
    const leftWall  = '#3a2b1c';
    const rightWall = '#4a3b2c';
    const backWall  = '#2a1b0c';
    const ceiling   = '#1a0b00';
    const floor     = '#0a0500';

    // B"H - Clip boundary in LOCAL space (centered at 0, 0)
    const clipRect = [
      { type: 'move', x: -width / 2, y: -height / 2 },
      { type: 'line', x:  width / 2, y: -height / 2 },
      { type: 'line', x:  width / 2, y:  height / 2 },
      { type: 'line', x: -width / 2, y:  height / 2 }
    ];

    // Interior room faces — perspective projection via polygon positioning
    const interior = [
      // Left Wall (vanishes toward center-left vanishing point)
      G.path('w_left', [
        { type: 'move', x: -width / 2, y: -height / 2 },
        { type: 'line', x: -width / 4, y: -height / 4 },
        { type: 'line', x: -width / 4, y:  height / 4 },
        { type: 'line', x: -width / 2, y:  height / 2 }
      ], { fill: leftWall }),

      // Right Wall (vanishes toward center-right vanishing point)
      G.path('w_right', [
        { type: 'move', x:  width / 2, y: -height / 2 },
        { type: 'line', x:  width / 4, y: -height / 4 },
        { type: 'line', x:  width / 4, y:  height / 4 },
        { type: 'line', x:  width / 2, y:  height / 2 }
      ], { fill: rightWall }),

      // Ceiling (vanishes upward toward center vanishing point)
      G.path('w_ceil', [
        { type: 'move', x: -width / 2, y: -height / 2 },
        { type: 'line', x: -width / 4, y: -height / 4 },
        { type: 'line', x:  width / 4, y: -height / 4 },
        { type: 'line', x:  width / 2, y: -height / 2 }
      ], { fill: ceiling }),

      // Floor (vanishes downward toward center vanishing point)
      G.path('w_floor', [
        { type: 'move', x: -width / 2, y:  height / 2 },
        { type: 'line', x: -width / 4, y:  height / 4 },
        { type: 'line', x:  width / 4, y:  height / 4 },
        { type: 'line', x:  width / 2, y:  height / 2 }
      ], { fill: floor }),

      // Back Wall (the innermost surface — darkest, smallest)
      G.rect('w_back', -width / 4, -height / 4, width / 2, height / 2, { fill: backWall }),

      // A tiny desk inside the room — a spark of life
      G.rect('w_desk', -width / 6, height / 8, width / 3, 5, { fill: '#111' })
    ];

    // B"H - Use wx/wy in the ID only to ensure uniqueness across many windows.
    // When called with wx=0, wy=0 from WindowPane, the ID becomes 'parallax_win_0_0'
    // which is still unique per-window because WindowPane wraps each in its own group.
    return G.clip(`parallax_win_${wx}_${wy}`, null, clipRect, interior);
  }
}