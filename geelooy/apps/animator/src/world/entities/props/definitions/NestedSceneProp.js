
// B"H
import { VirtualGraph as G } from '../../../../engine/graph/VirtualGraph.js';
import { SkyGradientBuilder } from '../../../generation/sky/SkyGradientBuilder.js';

/**
 * @class NestedSceneProp
 * @description
 * ═══════════════════════════════════════════════════════════════
 * CHAPTER 34: THE UNIVERSE WITHIN (Olam B'Toch Olam)
 * ═══════════════════════════════════════════════════════════════
 * 
 * Renders a moving, dynamic scene clipped entirely within the bounds of a 
 * picture frame. It uses the global time to animate a sun rising and setting 
 * inside the painting itself!
 */
export class NestedSceneProp {
  static build(propData, transform, time, parentChar) {
    const s = transform.scaleX || 1.0;
    const w = 300 * s;
    const h = 200 * s;

    // Fast-flowing time for the nested universe
    const subTimeOfDay = (Math.sin(time * 0.001) + 1) / 2; // 0.0 to 1.0 cycle

    // The heavens of the painting
    const sky = SkyGradientBuilder.build(subTimeOfDay, w, h);

    // A tiny sun moving across the painting's sky
    const sunX = -w/2 + (subTimeOfDay * w);
    const sunY = -h/2 + Math.abs(Math.cos(subTimeOfDay * Math.PI)) * (h/2);

    const artContent = [
      G.group('nested_sky', { x: -w/2, y: -h/2 }, [sky]),
      G.circle('nested_sun', sunX, sunY, 15*s, { fill: '#fff700', stroke: '#ffaa00', lineWidth: 2*s }),
      G.path('nested_mnt', [
        { type: 'move', x: -w/2, y: h/2 },
        { type: 'line', x: -w/4, y: 0 },
        { type: 'line', x: 0, y: h/2 },
        { type: 'line', x: w/4, y: -h/4 },
        { type: 'line', x: w/2, y: h/2 }
      ], { fill: '#2c3e50', stroke: '#111', lineWidth: 2*s })
    ];

    const clipRect = [
      { type: 'move', x: -w/2, y: -h/2 },
      { type: 'line', x: w/2, y: -h/2 },
      { type: 'line', x: w/2, y: h/2 },
      { type: 'line', x: -w/2, y: h/2 }
    ];

    return G.group(propData.id, transform, [
      G.rect('f_wood', -w/2 - 15*s, -h/2 - 15*s, w + 30*s, h + 30*s, { fill: '#d4af37', stroke: '#000', lineWidth: 5*s, radius: 4*s }),
      G.rect('f_canvas', -w/2, -h/2, w, h, { fill: '#fff' }),
      G.clip('f_art_clip', null, clipRect, artContent),
      G.path('f_glass', [
        { type: 'move', x: w/2 - 10*s, y: -h/2 + 10*s }, 
        { type: 'line', x: -w/2 + 10*s, y: h/2 - 10*s }
      ], { stroke: 'rgba(255,255,255,0.2)', lineWidth: 15*s, lineCap: 'round' })
    ]);
  }
}
