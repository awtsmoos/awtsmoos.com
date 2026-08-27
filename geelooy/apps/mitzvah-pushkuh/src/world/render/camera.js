// B"H
// Render camera is still the breathing camera, now in render/.
import { pulse } from "../wave.js";
export function createCamera() {
  let x = 0, y = 0, tx = 0, ty = 0, zoom = 1, zt = 1, shake = 0;
  function bless(p, w, h) { tx = (p.x / w - .5) * -12; ty = (p.y / h - .5) * -10; zt = 1.012; }
  function strike() { shake = 10; zt = 1.035; }
  function update(dt) { x += (tx - x) * .06 * dt; y += (ty - y) * .06 * dt; zoom += (zt - zoom) * .08 * dt; zt += (1 - zt) * .03 * dt; shake *= Math.pow(.86, dt); }
  function apply(ctx, w, h, t) { const sx = x + pulse(t * 10, 3, shake), sy = y + pulse(t * 11, 7, shake); ctx.translate(w / 2 + sx, h / 2 + sy); ctx.scale(zoom, zoom); ctx.translate(-w / 2, -h / 2); }
  return { bless, strike, update, apply };
}
