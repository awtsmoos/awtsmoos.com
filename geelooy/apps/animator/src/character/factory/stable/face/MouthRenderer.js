// B"H
import { VirtualGraph as G } from '../../../../engine/graph/VirtualGraph.js';
import { StableShapeKit as S } from '../StableShapeKit.js';
import { StableMouthPlan } from '../StableMouthPlan.js';

/** Expressive mouth consumes speech and facePose without losing old plans. */
export class MouthRenderer {
  static build(kind, data, c, m, view, mood = {}) {
    const poseFace = data._stablePose?.face || {};
    const rp = data.renderPerformance?.face || {};
    const planned = StableMouthPlan.current(data);
    const open = Math.max(Number(poseFace.mouthOpen || 0), Number(data.mouthOpen || 0) * 0.82, Number(rp.mouthOpenAmount || 0));
    const shape = this.shape(planned, open, mood, data, rp);
    const perspective = this.perspective(view);
    const x = view.head.mouthX;
    const y = m.headY + 23 + view.head.mouthY + Number(rp.mouthJawAmount || 0) * 2.5;
    const w = Math.max(9, shape.w * perspective.scaleX);
    const h = Math.max(1.8, shape.h * perspective.scaleY);
    const smile = (mood.smile || 0) * 5.6 + shape.smile * 4;

    return S.group(`${kind}_mouth`, null, [
      G.path(`${kind}_mouth_shadow`, [{ type: 'move', x: x - w * 0.48, y: y + 2.5 }, { type: 'quad', cx: x, cy: y + h * 0.55 + smile * 0.55, x: x + w * 0.48, y: y + 2.5 }], { stroke: 'rgba(0,0,0,0.18)', lineWidth: 3.2, lineCap: 'round' }),
      G.path(`${kind}_mouth_lip`, [{ type: 'move', x: x - w * 0.58, y: y - smile * 0.28 }, { type: 'quad', cx: x, cy: y + smile, x: x + w * 0.58, y: y - smile * 0.28 }], { stroke: c.line, lineWidth: 2.5, lineCap: 'round' }),
      h > 2.2 ? G.ellipse(`${kind}_mouth_open`, x + perspective.offsetX, y + 1.5, w * 0.38, h * 0.43, 0, { fill: c.mouth, stroke: c.line, lineWidth: 1.4 }) : null,
      shape.teeth > 0.12 ? G.ellipse(`${kind}_teeth`, x + perspective.offsetX, y - h * 0.1, w * 0.26, 1.45, 0, { fill: c.tooth, stroke: 'rgba(0,0,0,0)', lineWidth: 0 }) : null,
      G.path(`${kind}_lower_lip`, [{ type: 'move', x: x - w * 0.32, y: y + h * 0.56 + 3 }, { type: 'quad', cx: x, cy: y + h * 0.86 + 3, x: x + w * 0.32, y: y + h * 0.56 + 3 }], { stroke: 'rgba(255,255,255,0.23)', lineWidth: 1.2, lineCap: 'round' })
    ]);
  }

  static shape(planned = {}, open = 0, mood = {}, data = {}, rp = {}) {
    const talking = data.isTalking || data.speech;
    const baseW = Number(planned.w || 15) + Math.abs(Number(rp.mouthSmileAmount || 0)) * 4;
    const baseH = Number(planned.h || 2.8) + Number(rp.mouthJawAmount || 0) * 4;
    const smile = Number(planned.smile || 0) + Number(mood.smile || 0) * 0.25 + Number(rp.mouthSmileAmount || 0) * 0.35;
    if (open > 0.42) return { w: Math.max(baseW, talking ? 22 : 18), h: Math.max(baseH, 11), teeth: 0.18, smile };
    if (open > 0.22) return { w: Math.max(baseW, 19), h: Math.max(baseH, 7.2), teeth: 0.08, smile };
    if (open > 0.08) return { w: Math.max(baseW, 17), h: Math.max(baseH, 4.2), teeth: 0, smile };
    return { w: baseW, h: Math.max(1.8, baseH), teeth: Number(planned.teeth || 0), smile };
  }

  static perspective(view = {}) {
    if (view.type === 'side') return { scaleX: 0.58, scaleY: 0.9, offsetX: view.dir * 1.8 };
    if (view.type === 'threeQuarter') return { scaleX: 0.84, scaleY: 1, offsetX: view.dir * 0.8 };
    return { scaleX: 1, scaleY: 1, offsetX: 0 };
  }
}
