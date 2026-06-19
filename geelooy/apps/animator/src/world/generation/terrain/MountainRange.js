
// B"H
import { VirtualGraph as G } from '../../../engine/graph/VirtualGraph.js';
import { AwtsmoosMath } from '../../../engine/core/AwtsmoosMath.js';

export class MountainRange {
  static build(data) {
    const segments = 15; 
    const step = data.w / segments;
    const points = [{ type: 'move', x: 0, y: 0 }];
    
    for (let i = 1; i <= segments; i++) {
      const px = i * step;
      let py = -AwtsmoosMath.seededRandom(data.x + i) * data.h - (i === segments || i === 0 ? 0 : data.h * 0.5);
      points.push({ type: 'line', x: px, y: py });
    }
    points.push({ type: 'line', x: data.w, y: 0 });
    
    return G.group(`mnt_${data.id || data.x}`, { x: data.x, y: data.y }, [
      G.path('mnt_base', points, { fill: data.color || '#2c3e50', stroke: '#111', lineWidth: 2 }),
      G.rect('mnt_snow', 0, -data.h, data.w, data.h * 0.35, { fill: 'rgba(255,255,255,0.85)', composite: 'source-atop' })
    ]);
  }
}
