
// B"H
import { VirtualGraph as G } from '../../../../../engine/graph/VirtualGraph.js';
import { HatBase } from '../HatBase.js';

/**
 * @class TopHat
 * @description
 * THE PILLAR OF MAJESTY.
 * B"H
 * A massive, towering cylinder that tapers inwards towards the top, 
 * exhibiting pure upper-class vector topology!
 */
export class TopHat extends HatBase {
  static build(data, profile) {
    const { h, hTop, color, view, dir } = this.getParams(data, profile);
    const nodes = [];

    const topHatH = 150; // Insane vertical height
    const baseW = h.rX * 0.8;
    const topW = h.rX * 0.95; // Flaring outward at the top slightly is classic

    // Shift crown in side view
    const xShift = (view === 'side') ? (-10 * dir) : 0;
    const brimW = h.rX + 45;

    // 1. The Rigid Lower Brim
    nodes.push(G.path('tophat_brim', [
      { type: 'move', x: -brimW + (view==='side' ? 20*dir : 0), y: hTop + 15 },
      // Arching down over the front, curving up in the back
      { type: 'quad', cx: xShift, cy: hTop + 30, x: brimW + (view==='side' ? 20*dir : 0), y: hTop + 15 },
      { type: 'quad', cx: xShift, cy: hTop + 5, x: -brimW + (view==='side' ? 20*dir : 0), y: hTop + 15 }
    ], { fill: '#111', stroke: '#000', lineWidth: 5, lineJoin: 'round' }));

    // 2. The Sweeping Crown
    nodes.push(G.path('tophat_crown', [
      { type: 'move', x: -baseW + xShift, y: hTop + 12 },
      { type: 'quad', cx: -baseW * 0.8 + xShift, cy: hTop - (topHatH*0.5), x: -topW + xShift, y: hTop - topHatH },
      { type: 'quad', cx: xShift, cy: hTop - topHatH - 12, x: topW + xShift, y: hTop - topHatH }, // Arched ceiling
      { type: 'quad', cx: baseW * 0.8 + xShift, cy: hTop - (topHatH*0.5), x: baseW + xShift, y: hTop + 12 }
    ], { fill: color, stroke: '#000', lineWidth: 4, lineJoin: 'round' }));

    // 3. The Silk Band (Deep Crimson)
    nodes.push(G.path('tophat_band', [
      { type: 'move', x: -baseW * 0.95 + xShift, y: hTop - 25 },
      { type: 'quad', cx: xShift, cy: hTop - 15, x: baseW * 0.95 + xShift, y: hTop - 25 },
      { type: 'line', x: baseW + xShift, y: hTop + 12 },
      { type: 'quad', cx: xShift, cy: hTop + 20, x: -baseW + xShift, y: hTop + 12 }
    ], { fill: '#800020', stroke: '#000', lineWidth: 3, lineJoin: 'round' }));

    // 4. Highlight reflection indicating stiff polished felt
    nodes.push(G.path('tophat_shine', [
      { type: 'move', x: -baseW * 0.5 + xShift, y: hTop + 5 },
      { type: 'quad', cx: -baseW * 0.4 + xShift, cy: hTop - (topHatH*0.5), x: -topW * 0.6 + xShift, y: hTop - topHatH + 5 }
    ], { stroke: 'rgba(255,255,255,0.15)', lineWidth: 12, lineCap: 'round' }));

    return G.group('tophat_sys', null, nodes);
  }
}
