
// B"H
import { VirtualGraph as G } from '../../../../engine/graph/VirtualGraph.js';

/**
 * @class BillboardProp
 * @description
 * THE NESTED SCENE (Luchot HaOlam).
 * B"H
 * 
 * An isolated module rendering a massive world-prop that features 
 * a clipping mask and an actively animating sub-scene (a sun moving across a sky).
 */
export class BillboardProp {
  static build(propData, transform, time, parentChar) {
    const s = transform.scaleX || 1.0;
    
    const bw = 600 * s;
    const bh = 300 * s;
    // B"H - Animating element locked within the billboard frame
    const screenTime = (time * 0.1) % bw;
    
    const screenContent = [
      G.rect('bb_sky', 0, 0, bw, bh, { fill: '#002244' }),
      G.circle('bb_sun', screenTime, 100*s, 40*s, { fill: '#ff0055' }),
      G.text('bb_ad', 'BUY MORE AWTSMOOS', bw/2, bh/2, { fill: '#fff', font: `900 ${40*s}px sans-serif`, textShadow: '#ff0055', align: 'center' })
    ];

    const screenClip = G.clip('bb_screen_clip', { x: -bw/2, y: -bh }, [
      { type: 'move', x: 0, y: 0 },
      { type: 'line', x: bw, y: 0 },
      { type: 'line', x: bw, y: bh },
      { type: 'line', x: 0, y: bh }
    ], screenContent);

    return G.group(propData.id, transform, [
      G.rect('bb_frame', -bw/2 - 20*s, -bh - 20*s, bw + 40*s, bh + 40*s, { fill: '#111', stroke: '#00ffcc', lineWidth: 4*s }),
      G.rect('bb_pole', -20*s, 0, 40*s, 500*s, { fill: '#222', stroke: '#000', lineWidth: 4*s }),
      screenClip
    ]);
  }
}
