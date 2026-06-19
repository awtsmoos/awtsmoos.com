
// B"H

/**
 * @file CharacterFailureOverlay.js
 * @description
 * ============================================================================
 * CHAPTER: THE SCREEN-SPACE HUMAN THAT APPEARED EVEN WHEN THE ACTOR PLANE ERRED
 * ============================================================================
 *
 * If the actor-plane graph fails or the camera pushes fallback characters away,
 * this overlay paints directly on the canvas after the pipeline. No graph. No
 * camera. Just visible proof: characters attempted, failures caught, and the
 * world is still breathing.
 *
 * @module CharacterFailureOverlay
 */

/**
 * @class CharacterFailureOverlay
 * @description
 * Direct canvas emergency character/failure painter.
 */
export class CharacterFailureOverlay {
  /**
   * Paints failures if present.
   *
   * @param {Object} app - App object.
   * @returns {void}
   */
  static paint(app) {
    if (!app || !app.ctx || !app.ctx.ctx || !app.state || !app.state.get) return;

    const failures = app.state.get('character_render_failures') || [];
    if (!failures.length) return;

    const ctx = app.ctx.ctx;
    const canvas = app.ctx.canvas;
    const w = canvas.width || 800;
    const h = canvas.height || 600;
    const x = Math.min(w - 150, Math.max(40, w * 0.5 - 70));
    const y = Math.min(h - 260, Math.max(140, h * 0.52));

    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalAlpha = 0.96;

    ctx.fillStyle = 'rgba(0,0,0,0.68)';
    ctx.fillRect(18, 18, Math.min(520, w - 36), 86);
    ctx.strokeStyle = '#ffdf3d';
    ctx.lineWidth = 2;
    ctx.strokeRect(18, 18, Math.min(520, w - 36), 86);
    ctx.fillStyle = '#ffffff';
    ctx.font = '15px monospace';
    ctx.fillText('B"H character fallback active', 30, 46);
    ctx.fillText(String(failures[failures.length - 1].message).slice(0, 56), 30, 72);

    ctx.fillStyle = '#111827';
    ctx.fillRect(x + 48, y + 88, 54, 132);
    ctx.fillStyle = '#4657ff';
    ctx.fillRect(x + 34, y + 32, 82, 90);
    ctx.fillStyle = '#f1c29a';
    ctx.beginPath();
    ctx.arc(x + 75, y, 34, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#111111';
    ctx.beginPath();
    ctx.arc(x + 64, y - 7, 4, 0, Math.PI * 2);
    ctx.arc(x + 86, y - 7, 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#6b1d1d';
    ctx.fillRect(x + 63, y + 12, 24, 4);

    ctx.fillStyle = '#4657ff';
    ctx.fillRect(x + 8, y + 44, 26, 100);
    ctx.fillRect(x + 116, y + 44, 26, 100);

    ctx.fillStyle = '#111827';
    ctx.fillRect(x + 42, y + 214, 24, 96);
    ctx.fillRect(x + 84, y + 214, 24, 96);

    ctx.restore();
  }
}
