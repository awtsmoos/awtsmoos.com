// B"H
import { VirtualGraph as G } from '../../../engine/graph/VirtualGraph.js';

/** Organic connected cartoon shapes, including articulated five-digit hands. */
export class StableShapeKit {
  static num(value, fallback = 0) { return Number.isFinite(value) ? value : fallback; }
  static clamp(value, min, max) { return Math.max(min, Math.min(max, this.num(value, min))); }

  static group(id, transform = null, children = []) {
    const t = transform ? { x: this.num(transform.x, 0), y: this.num(transform.y, 0), scaleX: this.num(transform.scaleX, 1), scaleY: this.num(transform.scaleY, 1), rotation: this.num(transform.rotation, 0) } : null;
    return G.group(id, t, (children || []).flat().filter(Boolean));
  }

  static poly(id, points, style = {}) {
    const p = (points || []).filter(a => Array.isArray(a) && a.length >= 2);
    const path = p.map((pt, i) => ({ type: i === 0 ? 'move' : 'line', x: this.num(pt[0]), y: this.num(pt[1]) }));
    if (p.length) path.push({ type: 'line', x: p[0][0], y: p[0][1] });
    return G.path(id, path, style);
  }

  static rect(id, x, y, w, h, style = {}) { return this.poly(id, [[x, y], [x + w, y], [x + w, y + h], [x, y + h]], style); }

  static tapered(id, a, b, w1, w2, style = {}) {
    const dx = b.x - a.x, dy = b.y - a.y, len = Math.max(1, Math.hypot(dx, dy));
    const nx = -dy / len, ny = dx / len;
    return this.poly(id, [[a.x + nx * w1 * .5, a.y + ny * w1 * .5], [b.x + nx * w2 * .5, b.y + ny * w2 * .5], [b.x - nx * w2 * .5, b.y - ny * w2 * .5], [a.x - nx * w1 * .5, a.y - ny * w1 * .5]], style);
  }

  static limb(id, p) {
    return this.group(id, null, [
      this.tapered(`${id}_upper`, p.a, p.b, p.w1, p.w2, p.style),
      this.tapered(`${id}_lower`, p.b, p.c, p.w2, Math.max(5, p.w2 - 3), p.style),
      p.coverJoint === false ? null : G.ellipse(`${id}_joint_cover`, p.b.x, p.b.y, p.joint || 5, (p.joint || 5) * .75, 0, p.jointStyle || p.style)
    ]);
  }

  static shadow(id, x, y, rx, ry, alpha = 0.18) {
    return G.ellipse(id, x, y, rx, ry, 0, { fill: `rgba(0,0,0,${this.clamp(alpha, 0, 1)})`, stroke: 'rgba(0,0,0,0)', lineWidth: 0 });
  }

  static hand(id, x, y, side, c, pose = 'relaxed') {
    const s = side < 0 ? -1 : 1;
    const curl = pose === 'open' ? -1.5 : pose === 'point' ? -0.4 : pose === 'hold' ? 1.5 : 0.6;
    const palm = G.ellipse(`${id}_palm`, x, y, 7.4, 9.2, s * 0.25, { fill: c.skin, stroke: c.line, lineWidth: 1.7 });
    const thumb = this.digit(`${id}_thumb`, x + s * 4.2, y + 1.2, s, 7, 4.2, c, -0.8, 1.7);
    const fingers = [0, 1, 2, 3].map(i => {
      const spread = (i - 1.5) * 2.35;
      const len = pose === 'point' && i === 1 ? 10.4 : 7.5 - Math.abs(i - 1.5) * 0.7;
      const bend = pose === 'point' && i !== 1 ? 3.5 : curl + i * 0.15;
      return this.digit(`${id}_finger_${i + 1}`, x + s * (1.8 + spread * .2), y - 4.8 + spread, s, len, bend, c, 0.2, 1.25);
    });
    return this.group(id, null, [palm, thumb, ...fingers, G.circle(`${id}_wrist_knuckle`, x - s * 4.8, y + 5.8, 1.3, { fill: c.skinDark || c.skin, stroke: c.line, lineWidth: .7 })]);
  }

  static digit(id, x, y, s, len, bend, c, lift = 0, width = 1.1) {
    return G.path(id, [{ type: 'move', x, y }, { type: 'quad', cx: x + s * len * .48, cy: y + lift + bend, x: x + s * len, y: y + bend }], { stroke: c.line, lineWidth: width, lineCap: 'round' });
  }
}
