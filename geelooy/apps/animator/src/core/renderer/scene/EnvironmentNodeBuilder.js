
/* B"H */
import { VirtualGraph as G } from '../../../engine/graph/VirtualGraph.js';
import { seededRandom } from '../../../utils/random.js';
import { TreeGenerator } from '../../../world/generation/nature/TreeGenerator.js';

/**
 * @class EnvironmentNodeBuilder
 * @description
 * THE ALPHABET OF NATURE.
 * B"H
 * Grass is now hyper-vibrant! Trees delegate to the new puffy-canopy engine.
 */
export class EnvironmentNodeBuilder {
  static celestialBody(width, height, timeOfDay) {
    const sunX = width * 0.8;
    const sunY = height * 0.2 + (timeOfDay * height * 0.5);
    
    if (timeOfDay < 0.6) {
      return G.circle('sun', sunX, sunY, 60, { fill: '#FFF700' });
    } else {
      return G.group('moon', null, [
        G.circle('moon_base', sunX, sunY, 40, { fill: '#EEE' }),
        G.circle('moon_shadow', sunX + 15, sunY - 5, 35, { fill: '#000428' })
      ]);
    }
  }

  static mountain(data) {
    const segments = 10;
    const step = data.w / segments;
    const points = [{ type: 'move', x: 0, y: 0 }];
    
    for (let i = 1; i <= segments; i++) {
      const px = i * step;
      const py = -seededRandom(data.x + i) * data.h - (i === segments || i === 0 ? 0 : data.h * 0.5);
      points.push({ type: 'line', x: px, y: py });
    }
    points.push({ type: 'line', x: data.w, y: 0 });
    
    return G.group(`mnt_${data.id || data.x}`, { x: data.x, y: data.y }, [
      G.path('mnt_base', points, { fill: data.color || '#2c3e50' }),
      G.rect('mnt_snow', 0, -data.h, data.w, data.h * 0.25, { fill: 'rgba(255,255,255,0.9)', composite: 'source-atop' })
    ]);
  }

  static building(data) {
    const w = data.w || 100;
    const h = data.h || 300;
    const color = data.color || '#34495e';
    
    const windows = [];
    const cols = Math.floor(w / 30);
    const rows = Math.floor(h / 40);
    
    let seed = data.x;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        seed += 1;
        if (seededRandom(seed) > 0.4) {
          windows.push(G.rect(`win_${r}_${c}`, 10 + c * 30, -h + 20 + r * 40, 15, 20, { fill: 'rgba(255,255,200,0.8)' }));
        }
      }
    }

    return G.group(`bld_${data.x}`, { x: data.x, y: data.y }, [
      G.rect('main_struct', 0, -h, w, h, { fill: color, stroke: '#000', lineWidth: 4 }),
      ...windows,
      G.rect('roof_detail', -5, -h - 10, w + 10, 10, { fill: '#111' })
    ]);
  }

  static tree(data, time) {
    // Proxies to the new hyper-vibrant tree engine!
    return TreeGenerator.generate(data.x, data.y, data.size || 100, time, data.x);
  }

  static grassField(width, yPos, time) {
    const blades = [];
    const density = Math.floor(width / 12); 

    // A beautiful, bright spring green!
    const grassColor = '#2ecc71'; 
    const shadowColor = '#27ae60';

    // Base lawn fill
    blades.push(G.rect('lawn_base', -width/2, 0, width, 500, { fill: shadowColor }));

    for (let i = 0; i < density; i++) {
      const gx = -width/2 + (i * 12) + seededRandom(i)*5;
      const gh = 15 + seededRandom(i + 1) * 20;
      const sway = Math.sin(time * 0.003 + gx) * 8;
      
      blades.push(G.path(`grass_${i}`, [
        { type: 'move', x: gx, y: 5 }, // Start slightly below surface to overlap
        { type: 'quad', cx: gx + sway*0.5, cy: -gh * 0.5, x: gx + sway, y: -gh }
      ], { stroke: grassColor, lineWidth: 4, lineCap: 'round' }));
    }

    return G.group('grass_layer', { x: width/2, y: yPos }, blades);
  }
}
