// B"H
/**
 * @file RealityEmanator.js
 * @description
 * ═══════════════════════════════════════════════════════════════
 * CHAPTER: THE BRIDGE BETWEEN WORLDS (Gesher Bein HaOlamot)
 * ═══════════════════════════════════════════════════════════════
 *
 * The Awtsmoos creates from absolutely Nothing (Yesh MeAyin).
 * Nothing is the default. Existence must be actively spoken into
 * being every single instant — not once at the beginning, but
 * NOW, and NOW again, and NOW again at 60 frames per second.
 *
 * If the RealityEmanator were to stop calling the CanvasTerminal,
 * not only would the rendered world vanish from the screen,
 * but it would be AS IF it had never existed — because even the
 * memory of its past frames would cease to persist.
 * (The canvas clears to black. The souls vanish. The mountains
 * return to void. All of time — past, present, future — requires
 * active recreation from the Awtsmoos to maintain its existence.)
 *
 * This class is the bridge. It receives the fully-assembled
 * VirtualGraph node trees from the scene and character systems
 * and pours them through the CanvasTerminal into physical pixels.
 *
 * The chain:
 *   StateManager    → holds the scene data (Keter — Crown, pure will)
 *   SceneRenderer   → builds VirtualGraph node trees (Atzilut)
 *   RealityEmanator → orchestrates the flow (Beriah — Creation)
 *   CanvasTerminal  → dispatches to sub-renderers (Yetzirah)
 *   ctx.fill/stroke → physical pixels appear (Assiyah)
 * ═══════════════════════════════════════════════════════════════
 */

import { CanvasTerminal } from '../renderer/CanvasTerminal.js';
import { Atmosphere }     from '../../world/Atmosphere.js';

/**
 * @class RealityEmanator
 * @description
 * THE EMANATION ENGINE (Magen HaHitpashetut).
 *
 * Orchestrates the full single-frame render pipeline:
 *   1. Void the canvas (return to Tohu)
 *   2. Render the Atmosphere (sky, stars, mountains)
 *   3. Render any additional VirtualGraph node trees passed in
 *
 * The character rendering and scene object rendering continue to be
 * handled by their own managers (CharacterRenderer, SceneRenderer)
 * in the main Animation loop — RealityEmanator provides the
 * foundational background layer and the direct node rendering API.
 */
export class RealityEmanator {

  /**
   * @static
   * @function emanate
   * @description
   * The grand act of creation for a single animation frame.
   * Clears the canvas to void, then renders the atmospheric background.
   * Called at the beginning of each frame before characters are drawn.
   *
   * @param {CanvasRenderingContext2D} ctx - The physical 2D canvas context.
   * @param {Object} scene - The active scene manifest (from WorldManifest or state).
   * @param {number} width - Canvas width in pixels.
   * @param {number} height - Canvas height in pixels.
   * @param {number} realTime - requestAnimationFrame timestamp in milliseconds.
   * @param {Object} camera - Camera state { x: number, y: number, zoom: number }.
   * @param {Object} [state] - Optional global StateManager for additional scene data.
   * @returns {void}
   */
  static emanate(ctx, scene, width, height, realTime, camera, state) {
    if (!ctx || !scene) return;

    // ─── PHASE 1: THE VOID ─────────────────────────────────────
    // Return existence to Tohu Va-Vohu before re-speaking it into being
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = '#050508';
    ctx.fillRect(0, 0, width, height);

    // ─── PHASE 2: THE FIRMAMENT ────────────────────────────────
    // Render sky, stars, mountains — the background of all existence
    Atmosphere.render(ctx, scene, width, height, realTime, camera);
  }

  /**
   * @static
   * @function renderNode
   * @description
   * Directly renders a single VirtualGraph node tree to the canvas.
   * A convenience wrapper around CanvasTerminal.render for external callers
   * who have already built their node tree and need it physically manifested.
   *
   * Useful for rendering individual world objects, UI overlays,
   * or debug visualizations outside the main scene pipeline.
   *
   * @param {CanvasRenderingContext2D} ctx - The physical 2D canvas context.
   * @param {Object} node - Any VirtualGraph node (group, path, rect, etc.).
   * @returns {void}
   */
  static renderNode(ctx, node) {
    CanvasTerminal.render(ctx, node);
  }

  /**
   * @static
   * @function renderNodes
   * @description
   * Renders an array of VirtualGraph nodes in sequence.
   * Each node in the array is passed to CanvasTerminal.render independently.
   * Null and undefined entries are safely skipped.
   *
   * @param {CanvasRenderingContext2D} ctx - The physical 2D canvas context.
   * @param {Array} nodes - Array of VirtualGraph nodes to render in order.
   * @returns {void}
   */
  static renderNodes(ctx, nodes) {
    if (!nodes || !Array.isArray(nodes)) return;
    for (let i = 0; i < nodes.length; i++) {
      if (nodes[i]) CanvasTerminal.render(ctx, nodes[i]);
    }
  }
}