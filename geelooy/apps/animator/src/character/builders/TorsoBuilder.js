
/* B”H */
import { VirtualGraph as G } from '../../engine/graph/VirtualGraph.js';
import { ANATOMY } from '../data/Anatomy.js';
import { PerspectiveManager } from '../anatomy/PerspectiveManager.js';

/**
 * @class TorsoBuilder
 * @description
 * Builds the Torso (Tiferet) and Garments (Levushim) as JSON nodes.
 */
export class TorsoBuilder {
  static build(data) {
    const clothes = data.colors?.clothes || '#ff0000';
    const b = ANATOMY.body;
    const top = -b.h;
    const bottom = 0;
    const profile = PerspectiveManager.get(data.view);
    const { breath = 0 } = data.idle || {};

    const transform = {
      x: 0, 
      y: 0,
      scaleX: (1 + breath * 0.02) * profile.body.scaleX,
      scaleY: (1 + breath * 0.01)
    };

    const pathPoints = [
      { type: 'move', x: -b.widthTop, y: top },
      { type: 'line', x: -b.widthBottom, y: bottom },
      { type: 'quad', cx: 0, cy: bottom + 8, x: b.widthBottom, y: bottom },
      { type: 'line', x: b.widthTop, y: top },
      { type: 'quad', cx: 0, cy: top - 5, x: -b.widthTop, y: top }
    ];

    const style = {
      fill: clothes,
      stroke: '#000',
      lineWidth: 4
    };

    const nodes = [
      G.path('torso_shape', pathPoints, style)
    ];
    
    // Add lapels or collar
    nodes.push(G.path('collar_L', [
      { type: 'move', x: 0, y: top + 15 },
      { type: 'line', x: -b.widthTop * 0.35, y: top },
      { type: 'line', x: -b.widthTop * 0.45, y: top + 10 },
      { type: 'line', x: 0, y: top + 60 }
    ], { stroke: '#000000', lineWidth: 1.5, fill: '#111' }));
    
    nodes.push(G.path('collar_R', [
      { type: 'move', x: 0, y: top + 15 },
      { type: 'line', x: b.widthTop * 0.35, y: top },
      { type: 'line', x: b.widthTop * 0.45, y: top + 10 },
      { type: 'line', x: 0, y: top + 60 }
    ], { stroke: '#000000', lineWidth: 1.5, fill: '#111' }));
    
    // B"H - Collarbone (Clavicle) indication peeking through/above shirt
    nodes.push(G.path('clavicle_L', [
      { type: 'move', x: -b.widthTop * 0.2, y: top + 8 },
      { type: 'line', x: -b.widthTop * 0.7, y: top + 4 }
    ], { stroke: '#000000', lineWidth: 1.5 }));
    
    nodes.push(G.path('clavicle_R', [
      { type: 'move', x: b.widthTop * 0.2, y: top + 8 },
      { type: 'line', x: b.widthTop * 0.7, y: top + 4 }
    ], { stroke: '#000000', lineWidth: 1.5 }));

    // Seam details (Armholes)
    nodes.push(G.path('arm_seam_L', [
      { type: 'move', x: -b.widthTop * 0.8, y: top },
      { type: 'quad', cx: -b.widthTop * 0.6, cy: top + 20, x: -b.widthTop * 0.9, y: top + 40 }
    ], { stroke: '#000000', lineWidth: 1.5, lineDash: [4, 4] }));
    
    nodes.push(G.path('arm_seam_R', [
      { type: 'move', x: b.widthTop * 0.8, y: top },
      { type: 'quad', cx: b.widthTop * 0.6, cy: top + 20, x: b.widthTop * 0.9, y: top + 40 }
    ], { stroke: '#000000', lineWidth: 1.5, lineDash: [4, 4] }));

    // Add buttons/zippers if visible
    if (data.clothesType !== 'none') {
      nodes.push(G.circle('button_1', 0, top + 30, 4, { fill: '#222' }));
      nodes.push(G.circle('button_2', 0, top + 50, 4, { fill: '#222' }));
      nodes.push(G.circle('button_3', 0, top + 70, 4, { fill: '#222' }));
    }

    return G.group('body_layer', transform, nodes);
  }
}
