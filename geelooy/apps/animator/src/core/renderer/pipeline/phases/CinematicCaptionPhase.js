// B"H
import { VirtualGraph as G } from '../../../../engine/graph/VirtualGraph.js';

/**
 * @file CinematicCaptionPhase.js
 * @description
 * Chapter: The subtitle learned timing and mercy.
 * Captions now fade in/out, sit lower without eating the actor, and scale to
 * portrait glass without becoming a debug banner.
 */
export class CinematicCaptionPhase {
  /** @param {Object} state @param {Object} ctx @returns {Object|null} */
  static build(state, ctx = {}) {
    const dialogue = state?.get?.('activeDialogue');
    const text = dialogue?.text;
    if (!text) return null;

    const w = ctx.canvas?.width || ctx.width || 800;
    const h = ctx.canvas?.height || ctx.height || 600;
    const dpr = Math.max(1, globalThis.devicePixelRatio || 1);
    const alpha = this.alpha(dialogue.progress);
    if (alpha <= 0.01) return null;

    const bottom = Math.max(34 * dpr, h * 0.058);
    const boxW = Math.min(w - 44 * dpr, 600 * dpr);
    const lines = this.wrap(text, w < 760 ? 30 : 48);
    const lineH = 20 * dpr;
    const boxH = Math.max(40 * dpr, lines.length * lineH + 13 * dpr);
    const x = (w - boxW) / 2;
    const y = h - bottom - boxH;

    return G.group('cinematic_caption', { opacity: alpha }, [
      G.rect('caption_backdrop', {
        x,
        y,
        width: boxW,
        height: boxH,
        fill: `rgba(0,0,0,${0.62 * alpha})`,
        stroke: `rgba(255,255,255,${0.22 * alpha})`,
        lineWidth: 1.4 * dpr,
        radius: 12 * dpr
      }),
      ...lines.map((line, i) => G.text(`caption_line_${i}`, line, x + boxW / 2, y + 16 * dpr + i * lineH, {
        fill: `rgba(255,255,255,${alpha})`,
        font: `${Math.round(14 * dpr)}px system-ui, sans-serif`,
        align: 'center',
        baseline: 'top',
        weight: '700'
      }))
    ]);
  }

  /** @param {number} progress @returns {number} */
  static alpha(progress) {
    const p = Math.max(0, Math.min(1, Number(progress) || 0));
    const fadeIn = Math.min(1, p / 0.1);
    const fadeOut = Math.min(1, (1 - p) / 0.12);
    return Math.max(0, Math.min(1, fadeIn, fadeOut));
  }

  /** @param {string} text @param {number} max @returns {Array<string>} */
  static wrap(text, max) {
    const words = String(text || '').split(/\s+/).filter(Boolean);
    const out = [];
    let line = '';

    for (const word of words) {
      const next = line ? `${line} ${word}` : word;
      if (next.length > max && line) {
        out.push(line);
        line = word;
      } else {
        line = next;
      }
    }

    if (line) out.push(line);
    return out.slice(0, 2);
  }
}
