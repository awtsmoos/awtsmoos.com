// B"H
/**
 * @file CanvasTerminal.js
 * @description
 * ═══════════════════════════════════════════════════════════════
 * CHAPTER: THE TERMINAL OF ALL LIGHT (Malchut D'Atzilut)
 * ═══════════════════════════════════════════════════════════════
 *
 * "Forever, O Lord, Your Word stands in the heavens." — Tehillim 119:89
 *
 * The CanvasTerminal is the Malchut of the rendering pipeline —
 * the lowest Sefira, the final vessel, the point where the
 * abstract divine speech (VirtualGraph JSON nodes from Atzilut)
 * crashes down through all the intermediate worlds and emerges
 * as physical light on the HTML5 Canvas (Assiyah).
 *
 * The chain of emanation:
 *   ATZILUT  — The will: a JSON node object in memory.
 *   BERIAH   — The plan: CanvasTerminal receives it.
 *   YETZIRAH — The formation: dispatch to the correct sub-renderer.
 *   ASSIYAH  — The action: ctx.fill(), ctx.stroke(), ctx.drawImage().
 *
 * Without the CanvasTerminal, all VirtualGraph nodes would remain
 * as pure formless JSON floating in the RAM — beautiful, but invisible.
 * They need Malchut to be REVEALED. That is this file.
 *
 * The dispatch map routes each node type to its specialist renderer
 * the way the Awtsmoos channels His infinite will through the
 * specific letter-combinations that produce each creation.
 * ═══════════════════════════════════════════════════════════════
 *
 * @param {CanvasRenderingContext2D} ctx - The 2D rendering context of the HTML canvas.
 * @param {Object} node - A VirtualGraph node of any type.
 */

import { GroupRenderer }  from './terminal/GroupRenderer.js';
import { PathRenderer }   from './terminal/PathRenderer.js';
import { ShapeRenderer }  from './terminal/ShapeRenderer.js';
import { TextRenderer }   from './terminal/TextRenderer.js';
import { ClipRenderer }   from './terminal/ClipRenderer.js';
import { BitmapRenderer } from './terminal/BitmapRenderer.js';

/**
 * @class CanvasTerminal
 * @description
 * THE MOUTH OF THE WORLD (Peh D'Malchut).
 *
 * The grand dispatcher. Accepts any VirtualGraph node and routes it
 * to the precise sub-renderer that knows how to convert it into
 * physical pixels. Stateless. Pure. Called 60 times per second.
 */
export class CanvasTerminal {

  /**
   * @static
   * @private
   * @property {Object} _DISPATCH_MAP
   * @description
   * THE TEN SEFIROT OF RENDERING (Eser Sefirot HaRender).
   * A map from node type string to the handler function that renders it.
   * Using a map object eliminates switch statements — pure data-driven dispatch,
   * as the Awtsmoos channels through specific sefirot for specific outcomes.
   */
  static _DISPATCH_MAP = {
    group:   (ctx, node, fn) => GroupRenderer.render(ctx, node, fn),
    clip:    (ctx, node, fn) => ClipRenderer.render(ctx, node, fn),
    rect:    (ctx, node)     => ShapeRenderer.renderRect(ctx, node),
    circle:  (ctx, node)     => ShapeRenderer.renderCircle(ctx, node),
    ellipse: (ctx, node)     => ShapeRenderer.renderEllipse(ctx, node),
    path:    (ctx, node)     => PathRenderer.render(ctx, node),
    text:    (ctx, node)     => TextRenderer.render(ctx, node),
    bitmap:  (ctx, node)     => BitmapRenderer.render(ctx, node),
  };

  /**
   * @static
   * @function render
   * @description
   * The singular entry point for all rendering in the Awtsmoos engine.
   * Every frame, thousands of nodes flow through this function —
   * each one a letter of the divine speech sustaining its part of reality.
   *
   * Groups are rendered recursively — the render function passes itself
   * as the third argument to GroupRenderer and ClipRenderer so they can
   * call back into CanvasTerminal for their children, achieving infinite
   * fractal depth of nested transforms.
   *
   * @param {CanvasRenderingContext2D} ctx - The physical 2D canvas context.
   * @param {Object} node - Any VirtualGraph node (group, rect, path, text, etc.).
   * @returns {void}
   */
  static render(ctx, node) {
    if (!ctx || !node || !node.type) return;

    const handler = CanvasTerminal._DISPATCH_MAP[node.type];

    if (handler) {
      handler(ctx, node, CanvasTerminal.render.bind(CanvasTerminal));
    } else {
      // Unknown node type — do not crash the universe, just warn
      console.warn(`B"H - CanvasTerminal: Unknown node type "${node.type}". The letter is unrecognized.`);
    }
  }
}