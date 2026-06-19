
// B"H
import { VirtualGraph as G } from '../../../../../engine/graph/VirtualGraph.js';
import { HatBase } from '../HatBase.js';

/**
 * @class CrownHat
 * @description
 * THE VESSEL OF MALCHUT.
 * B"H
 * Exquisite gold topology wrapping dynamically over the skull boundary.
 */
export class CrownHat extends HatBase {
  static build(data, profile) {
    const { h, hTop, view, dir } = this.getParams(data, profile);
    const nodes = [];

    const gold = '#ffd700';
    const darkGold = '#ccaa00';
    const cw = h.rX + 10;
    
    // The Base Rim wrapping the forehead
    nodes.push(G.path('crown_base', [
      { type: 'move', x: -cw, y: hTop + 10 },
      { type: 'line', x: -cw + 5, y: hTop - 15 },
      { type: 'quad', cx: 0, cy: hTop - 5, x: cw - 5, y: hTop - 15 },
      { type: 'line', x: cw, y: hTop + 10 },
      { type: 'quad', cx: 0, cy: hTop + 25, x: -cw, y: hTop + 10 }
    ], { fill: darkGold, stroke: '#000', lineWidth: 4, lineJoin: 'round' }));

    // The Golden Spikes (Prongs of Malchut)
    // 5 Majestic Points
    const spikeH = 75;
    
    const buildSpike = (xOff, yBase, tipH) => {
       const path = [
         { type: 'move', x: xOff - 15, y: yBase },
         { type: 'line', x: xOff, y: yBase - tipH }, // Tip!
         { type: 'line', x: xOff + 15, y: yBase }
       ];
       return G.path(`crown_spike_${xOff}`, path, { fill: gold, stroke: '#000', lineWidth: 4, lineJoin: 'round' });
    };

    // Center, Mid-Left, Mid-Right, Far-Left, Far-Right
    nodes.push(
      buildSpike(-cw*0.8, hTop - 10, spikeH * 0.6),
      buildSpike(cw*0.8, hTop - 10, spikeH * 0.6),
      buildSpike(-cw*0.4, hTop - 5, spikeH * 0.8),
      buildSpike(cw*0.4, hTop - 5, spikeH * 0.8),
      buildSpike(0, hTop - 2, spikeH * 1.0) // Supreme Center Tip
    );

    // The Royal Jewels (Rubies, Emeralds, Sapphires)
    const buildJewel = (x, y, color, type='circle') => {
      if (type === 'diamond') {
        return G.path(`jewel_${x}`, [
          { type: 'move', x: x, y: y - 8 }, { type: 'line', x: x + 6, y: y },
          { type: 'line', x: x, y: y + 8 }, { type: 'line', x: x - 6, y: y }
        ], { fill: color, stroke: '#000', lineWidth: 2 });
      }
      return G.circle(`jewel_${x}`, x, y, 6, { fill: color, stroke: '#000', lineWidth: 2 });
    };

    // Base Rim Jewels
    nodes.push(
      buildJewel(-cw*0.6, hTop + 5, '#e74c3c', 'diamond'), // Red
      buildJewel(0, hTop + 10, '#3498db', 'circle'), // Blue
      buildJewel(cw*0.6, hTop + 5, '#2ecc71', 'diamond') // Green
    );

    // Prongs Tipping Jewels
    nodes.push(
      buildJewel(-cw*0.4, hTop - 5 - (spikeH*0.8) - 6, '#ffffff', 'circle'),
      buildJewel(0, hTop - 2 - spikeH - 8, '#ff0055', 'diamond'),
      buildJewel(cw*0.4, hTop - 5 - (spikeH*0.8) - 6, '#ffffff', 'circle')
    );

    return G.group('crown_sys', null, nodes);
  }
}
