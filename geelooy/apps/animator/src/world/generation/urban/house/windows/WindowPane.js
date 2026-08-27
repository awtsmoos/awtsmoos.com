// B"H
import { VirtualGraph as G } from '../../../../../engine/graph/VirtualGraph.js';
import { WindowShine }      from './WindowShine.js';
import { ParallaxWindow }   from './ParallaxWindow.js';

/**
 * @file WindowPane.js
 * @description
 * ═══════════════════════════════════════════════════════════════
 * CHAPTER: THE WINDOW INTO THE WORLD (Chalon El HaOlam)
 * THE COORDINATE CLARITY RECTIFICATION
 * ═══════════════════════════════════════════════════════════════
 * B"H
 *
 * THE POEM OF THE CONFUSED COORDINATES:
 * wx and wy were passed deep into the pane,
 * But inside the group, local space was the domain!
 * The parent G.group({x:wx, y:wy}) already placed us there,
 * So ParallaxWindow got world coords — but needed local air!
 * It used them only as fragments of its ID name,
 * A silent bug — cosmetically hidden, structurally lame.
 * Now we pass 0,0 — the local origin — clean and clear,
 * And document WHY, so no future confusion can appear!
 *
 * @class WindowPane
 */
export class WindowPane {
  /**
   * @function build
   * @description
   * Assembles a complete window pane with:
   * - A concrete frame (thick dark rect)
   * - A ParallaxWindow interior (faux-3D perspective room geometry)
   * - A glass shine polygon on top
   *
   * All coordinates are LOCAL to the window's own G.group transform.
   * The parent group is already positioned at (wx, wy) world space.
   *
   * @param {number} wx - Absolute world X (used by parent group transform).
   * @param {number} wy - Absolute world Y (used by parent group transform).
   * @param {number} r  - Row index in the window matrix (used for ID generation).
   * @param {number} c  - Column index in the window matrix (used for ID generation).
   * @returns {Object} A VirtualGraph group node.
   */
  static build(wx, wy, r, c) {
    return G.group(`win_${r}_${c}`, { x: wx, y: wy }, [

      // ── THE FRAME ───────────────────────────────────────────────────────
      G.rect('frame', -15, -20, 30, 40, {
        fill: '#111', stroke: '#000', lineWidth: 3
      }),

      // ── THE 3D INTERIOR ──────────────────────────────────────────────────
      // B"H - RECTIFICATION: Pass 0, 0 as the position arguments.
      // The window is already correctly positioned by the parent G.group({x:wx,y:wy}).
      // wx/wy were previously passed here but only used as ID-string fragments
      // inside ParallaxWindow, creating a misleading signature.
      // The clip boundary and interior geometry are drawn in LOCAL (0,0) space.
      ParallaxWindow.build(0, 0, 24, 34),

      // ── THE GLASS SHINE ──────────────────────────────────────────────────
      // Sits ON TOP of the 3D room geometry to complete the illusion
      WindowShine.build()
    ]);
  }
}