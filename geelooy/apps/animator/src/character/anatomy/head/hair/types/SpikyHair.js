
// B"H
import { VirtualGraph as G } from '../../../../../engine/graph/VirtualGraph.js';
import { HairBase } from '../HairBase.js';

/**
 * @class SpikyHair
 * @description
 * THE JAGGGED CROWN.
 * B"H
 */
export class SpikyHair extends HairBase {
  static build(data, profile) {
    const { h, color, view, dir } = this.getParams(data, profile);
    const nodes = [];

    const foreheadArc = this.getForeheadArc(h, dir, view);
    let lx = -h.rX;
    let rx = h.rX;
    if (view === 'side') { lx = -h.rX * 0.65; rx = h.rX * 0.85 * dir; }
    if (view === 'threeQuarter') { lx = -h.rX * 0.85; }
    
    const spikePoints = [...foreheadArc]; // Ends at lx
    
    const numSpikes = 7;
    for (let i = 0; i <= numSpikes; i++) {
      const pct = i / numSpikes;
      const baseCurrX = lx + ((rx - lx) * pct);
      const baseCurrY = -h.rY * 0.9;
      
      // Giant angular jagged spikes reaching far above the skull
      const tipX = baseCurrX + (20 * dir);
      const tipY = -h.rY * 1.9 - (Math.sin(pct * Math.PI) * 30); 
      
      spikePoints.push({ type: 'line', x: tipX, y: tipY });
      
      if (i < numSpikes) {
        const nextBaseX = lx + ((rx - lx) * (pct + 0.5/numSpikes));
        spikePoints.push({ type: 'line', x: nextBaseX, y: baseCurrY });
      }
    }
    
    spikePoints.push({ type: 'line', x: rx, y: -h.rY * 0.45 });

    nodes.push(G.path('hair_spikes', spikePoints, { 
      fill: color, stroke: '#000000', lineWidth: 5, lineJoin: 'round' 
    }));

    // B"H - Spike Highlights: Sharp peaks of enlightenment.
    const highlightSpikes = [];
    for (let i = 0; i < numSpikes; i++) {
        const pct = i / numSpikes;
        const x = lx + ((rx - lx) * (pct + 0.1/numSpikes));
        highlightSpikes.push({ type: 'move', x: x, y: -h.rY * 1.0 });
        highlightSpikes.push({ type: 'line', x: x + (12 * dir), y: -h.rY * 1.5 });
    }
    nodes.push(G.path('hair_spike_highlights', highlightSpikes, { 
        stroke: 'rgba(255,255,255,0.12)', lineWidth: 6, lineCap: 'round' 
    }));

    return G.group('hair_spiky_sys', null, nodes);
  }
}
