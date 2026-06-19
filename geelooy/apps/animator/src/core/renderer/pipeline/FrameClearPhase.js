// B"H

/** Clears and paints a warm production base so no black void can appear. */
export class FrameClearPhase {
  static clear(ctx = {}) {
    const c = ctx.ctx;
    const canvas = ctx.canvas || c?.canvas;
    if (!c || !canvas) return;
    const w = canvas.width || 0;
    const h = canvas.height || 0;
    c.save();
    c.setTransform(1, 0, 0, 1, 0, 0);
    c.clearRect(0, 0, w, h);
    const wall = c.createLinearGradient(0, 0, 0, h || 1);
    wall.addColorStop(0, '#f9dfae');
    wall.addColorStop(0.58, '#ffe8bd');
    wall.addColorStop(1, '#d99b54');
    c.fillStyle = wall;
    c.fillRect(0, 0, w, h);
    c.fillStyle = '#a9652f';
    c.fillRect(0, h * 0.52, w, h * 0.22);
    c.fillStyle = '#6f3b1b';
    c.fillRect(0, h * 0.515, w, Math.max(8, h * 0.012));
    c.restore();
  }
}
