// B"H
import { VirtualGraph as G } from '../../../../engine/graph/VirtualGraph.js';
import { StableShapeKit as S } from '../StableShapeKit.js';

/** Eyes consume gaze, blink, squint, darts, and attention targets. */
export class EyeRenderer {
  static build(kind, c, m, view, mood = {}, blink = 0, data = {}) {
    const gaze = this.gaze(data, view);
    const lid = this.lid(mood, blink, data);
    const eyes = view.head.visibleEyes || [-1, 1];
    return eyes.map(side => this.eye({ kind, c, m, view, mood, blink, gaze, lid, side, data }));
  }

  static eye(spec) {
    const { kind, c, m, view, gaze, lid, side, data } = spec;
    const near = side === view.dir;
    const scale = near ? view.head.nearEyeScale : view.head.farEyeScale;
    const x = this.eyeX(view, side, near);
    const y = m.headY + view.head.eyeY + (near ? 0 : 1.2);
    const openness = data.renderPerformance?.face?.eyeOpenAmount ?? 1;
    const w = 8.9 * scale;
    const h = Math.max(1.1, 6.4 * scale * lid * Math.max(0.3, openness));
    const pupilX = this.clamp(gaze.x * 3.2 + view.dir * 1.2 * scale, -w * 0.42, w * 0.42);
    const pupilY = this.clamp(gaze.y * 1.5 + 0.7, -h * 0.2, h * 0.35);

    return S.group(`${kind}_eye_${side}`, { x, y }, [
      G.ellipse(`${kind}_eye_white_${side}`, 0, 0, w, h, 0, { fill: c.eyeLight, stroke: c.line, lineWidth: 1.9 }),
      G.circle(`${kind}_pupil_${side}`, pupilX, pupilY, Math.max(1.6, 2.55 * scale), { fill: c.eye, stroke: c.eye, lineWidth: 1 }),
      G.circle(`${kind}_catchlight_${side}`, pupilX - 0.8 * scale, pupilY - 0.9 * scale, Math.max(0.6, 0.9 * scale), { fill: 'rgba(255,255,255,0.85)', stroke: 'rgba(0,0,0,0)', lineWidth: 0 }),
      G.path(`${kind}_upper_lid_${side}`, [{ type: 'move', x: -w, y: -h * 0.62 }, { type: 'quad', cx: 0, cy: -h * 1.45, x: w, y: -h * 0.62 }], { stroke: c.line, lineWidth: 1.8, lineCap: 'round' }),
      lid < 0.42 ? G.path(`${kind}_blink_line_${side}`, [{ type: 'move', x: -w, y: 0 }, { type: 'quad', cx: 0, cy: 1.2, x: w, y: 0 }], { stroke: c.line, lineWidth: 2.2, lineCap: 'round' }) : null
    ]);
  }

  static eyeX(view, side, near) {
    if (view.type === 'side') return view.dir * (near ? 12.5 : 5.6);
    const quarter = view.type === 'threeQuarter' ? view.dir * (near ? 3 : 5) : 0;
    return side * view.head.eyeSpread + quarter;
  }

  static lid(mood = {}, blink = 0, data = {}) {
    const rp = data.renderPerformance?.face || {};
    return Math.max(0.08, Math.min(1.12, 1 - Math.max(blink, rp.blinkAmount || 0) - (mood.squint || 0) - (rp.squintAmount || 0)));
  }

  static gaze(data = {}, view = {}) {
    const rp = data.renderPerformance || {};
    const targetId = rp.attention?.targetId || data.lookAt;
    let base = { x: view.dir * 0.12, y: 0 };
    if (targetId && data._allCharacters?.[targetId]?.position && data.position) {
      const target = data._allCharacters[targetId].position;
      const dx = Number(target.x || 0) - Number(data.position.x || 0);
      base = { x: Math.max(-1, Math.min(1, dx / 220)), y: -0.08 };
    } else if (targetId && data._allProps?.[targetId]) {
      const prop = data._allProps[targetId];
      const dx = Number(prop.x || 0) - Number(data.position?.x || 0);
      base = { x: Math.max(-1, Math.min(1, dx / 220)), y: -0.25 };
    }
    return { x: base.x + Number(rp.face?.pupilOffsetX || 0), y: base.y + Number(rp.face?.pupilOffsetY || 0) };
  }

  static clamp(v, min, max) { return Math.max(min, Math.min(max, Number(v))); }
}
