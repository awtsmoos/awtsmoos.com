// B"H
import { VirtualGraph as G } from '../../../../engine/graph/VirtualGraph.js';

/**
 * @file NoseVessel.js
 * @description
 * THE SENSE OF SMELL (Reach).
 * B"H - Perspective-aware geometric nose.
 */
export class NoseVessel {
  static build(profile, characterData) {
    const isSide = profile.type === 'side';
    const dir = profile.dir || 1;
    const skinColor = characterData.colors?.skin || '#f2c1a2';

    if (isSide) {
      return G.group('nose_vessel', { x: 10 * dir, y: 0 }, [
        G.path('bridge', [
          { type: 'move', x: -10 * dir, y: -20 },
          { type: 'line', x: 20 * dir, y: 15 },
          { type: 'line', x: -5 * dir, y: 15 }
        ], { fill: skinColor, stroke: '#000', lineWidth: 2 })
      ]);
    }

    // Frontal perspective
    return G.group('nose_vessel', { x: 0, y: 0 }, [
      G.path('bridge_front', [
        { type: 'move', x: -5, y: -20 },
        { type: 'line', x: 5, y: -20 },
        { type: 'line', x: 12, y: 15 },
        { type: 'line', x: -12, y: 15 }
      ], { stroke: '#000', lineWidth: 1.5 }),
      G.path('nostrils', [
        { type: 'move', x: -12, y: 15 },
        { type: 'line', x: 12, y: 15 }
      ], { stroke: '#000', lineWidth: 3, lineCap: 'round' })
    ]);
  }
}
