// B"H
import { VirtualGraph as G } from '../../../engine/graph/VirtualGraph.js';

/**
 * @class SunEmanator
 * @description
 * THE GREAT LUMINARY (Ma'or HaGadol).
 * B"H - Absolutely zero blur or soft shadow! Flat geometric polygon rays of light
 * radiating from a solid circle core. The sun rotates its rays over time.
 */
export class SunEmanator {
  static build(width, height, timeOfDay, realTime) {
    if (timeOfDay >= 0.6) return null;
    const sunX = width * 0.8;
    const sunY = height * 0.2 + (timeOfDay * height * 0.7);
    const rayNodes = [];
    const rayCount = 12;
    const baseRotation = (realTime * 0.01) % 360;

    for (let i = 0; i < rayCount; i++) {
      const angle = baseRotation + (i * (360 / rayCount));
      const ray = G.path(`sun_ray_${i}`, [
        { type: 'move', x: -10, y: 0 },
        { type: 'line', x: 2000, y: -100 },
        { type: 'line', x: 2000, y: 100 },
        { type: 'line', x: 10, y: 0 }
      ], { fill: '#ffd966' });
      ray.transform = { rotation: angle };
      rayNodes.push(ray);
    }

    return G.group('sun_system', { x: sunX, y: sunY }, [
      ...rayNodes,
      G.circle('sun_corona', 0, 0, 90, { fill: '#ffc107' }),
      G.circle('sun_core', 0, 0, 70, { fill: '#f1c40f', stroke: '#000', lineWidth: 4 })
    ]);
  }
}