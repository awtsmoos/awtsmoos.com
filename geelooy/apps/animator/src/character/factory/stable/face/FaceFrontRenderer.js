// B"H
import { VirtualGraph as G } from '../../../../engine/graph/VirtualGraph.js';
import { StableShapeKit as S } from '../StableShapeKit.js';
import { EyeRenderer } from './EyeRenderer.js';
import { NoseRenderer } from './NoseRenderer.js';
import { MouthRenderer } from './MouthRenderer.js';

/** Front face with visible facePose consumption. */
export class FaceFrontRenderer {
  static build(kind, data, c, m, view, beard) {
    const mood = this.mood(data);
    const blink = this.blink(data);
    return S.group(`${kind}_face_front`, { x: view.head.offsetX, scaleX: view.head.scaleX }, [
      G.ellipse(`${kind}_head`, 0, m.headY, m.headRX, m.headRY, 0, { fill: c.skin, stroke: c.line, lineWidth: 4 }),
      G.ellipse(`${kind}_ear_l`, -m.headRX, m.headY, 7, 12, 0, { fill: c.skinDark, stroke: c.line, lineWidth: 2.2 }),
      G.ellipse(`${kind}_ear_r`, m.headRX, m.headY, 7, 12, 0, { fill: c.skinDark, stroke: c.line, lineWidth: 2.2 }),
      ...EyeRenderer.build(kind, c, m, view, mood, blink, data),
      ...this.brows(kind, c, m, view, mood),
      NoseRenderer.build(kind, c, m, view),
      this.cheeks(kind, c, m, mood),
      MouthRenderer.build(kind, data, c, m, view, mood),
      beard ? this.beard(kind, c, m) : null
    ]);
  }

  static mood(data = {}) {
    const face = data._stablePose?.face || {};
    const rp = data.renderPerformance?.face || {};
    if (Object.keys(face).length || Object.keys(rp).length) {
      return {
        brow: Number(face.browOuter ?? rp.browOuter ?? 0) * -18,
        browInner: Number(face.browInner ?? rp.browInner ?? 0),
        browPinch: Number(face.browPinch ?? rp.browSqueeze ?? 0),
        smile: Number(face.mouthSmile ?? rp.mouthSmileAmount ?? 0),
        squint: Number(face.squint ?? rp.squintAmount ?? (1 - Number(face.eyeOpen ?? rp.eyeOpenAmount ?? 1))),
        mouthOpen: Number(face.mouthOpen ?? rp.mouthOpenAmount ?? 0),
        cheekLift: Number(face.cheekLift ?? rp.cheekRaiseAmount ?? 0),
        blush: Number(rp.blushAmount || 0)
      };
    }
    const map = { happy: { brow: -4, smile: 1, squint: 0.05 }, excited: { brow: -7, smile: 0.85, squint: 0 }, focused: { brow: 3, smile: 0, squint: 0.15 }, surprised: { brow: -8, smile: 0.2, squint: -0.08 }, neutral: { brow: 0, smile: 0.05, squint: 0 } };
    return map[data.emotion] || map.neutral;
  }

  static blink(data = {}) {
    const rp = data.renderPerformance?.face || {};
    if (Number(rp.blinkAmount || 0) > 0) return Number(rp.blinkAmount);
    const time = Number(data._renderTime || 0);
    return ((time * 0.0017 + Number(data._index || 0)) % 5.4) < 0.11 ? 0.82 : 0;
  }

  static brows(kind, c, m, view, mood) {
    return [-1, 1].map(side => {
      const pinch = Number(mood.browPinch || 0) * (side < 0 ? 1 : -1) * 2.3;
      const inner = Number(mood.browInner || 0) * -5;
      return G.path(`${kind}_brow_${side}`, [
        { type: 'move', x: side * view.head.eyeSpread - side * 8 + pinch, y: m.headY - 25 + side * mood.brow * 0.22 + inner },
        { type: 'line', x: side * view.head.eyeSpread + side * 8, y: m.headY - 27 - side * mood.brow * 0.22 }
      ], { stroke: c.line, lineWidth: 3.5, lineCap: 'round' });
    });
  }

  static cheeks(kind, c, m, mood = {}) {
    const lift = Math.max(0.1, Number(mood.cheekLift || 0));
    const alpha = Math.min(0.45, 0.14 + lift * 0.38 + Number(mood.blush || 0) * 0.25);
    return S.group(`${kind}_cheeks`, null, [-1, 1].map(side => G.ellipse(`${kind}_cheek_${side}`, side * 19, m.headY + 11 - lift * 2, 6 + lift * 2, 4 + lift, 0, { fill: c.blush || `rgba(255,120,120,${alpha})`, stroke: 'rgba(0,0,0,0)', lineWidth: 0 })));
  }

  static beard(kind, c, m) {
    return G.path(`${kind}_beard`, [{ type: 'move', x: -27, y: m.headY + 23 }, { type: 'quad', cx: -18, cy: m.headY + 72, x: 0, y: m.beardBottomY }, { type: 'quad', cx: 18, cy: m.headY + 72, x: 27, y: m.headY + 23 }, { type: 'quad', cx: 0, cy: m.headY + 42, x: -27, y: m.headY + 23 }], { fill: c.beard, stroke: c.line, lineWidth: 3.2, lineJoin: 'round' });
  }
}
