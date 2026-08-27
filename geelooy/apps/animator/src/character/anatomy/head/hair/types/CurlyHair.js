
// B"H
import { VirtualGraph as G } from '../../../../../engine/graph/VirtualGraph.js';
import { HairBase } from '../HairBase.js';

/**
 * @class CurlyHair
 * @description
 * THE SCALLOPED DOME.
 * B"H
 */
export class CurlyHair extends HairBase {
  static build(data, profile) {
    const { h, color, view, dir } = this.getParams(data, profile);
    const nodes = [];

    const foreheadArc = this.getForeheadArc(h, dir, view);
    let lx = -h.rX;
    let rx = h.rX;
    if (view === 'side') { lx = -h.rX * 0.65; rx = h.rX * 0.85 * dir; }
    if (view === 'threeQuarter') { lx = -h.rX * 0.85; }
    
    const curlPoints = [...foreheadArc]; // Ends at lx
    
    const numCurls = 8;
    for (let i = 0; i < numCurls; i++) {
      const pct1 = i / numCurls;
      const pct2 = (i + 1) / numCurls;
      
      const x1 = lx + (rx - lx) * pct1;
      const y1 = -h.rY * 1.0 - Math.sin(pct1 * Math.PI) * 35;
      
      const x2 = lx + (rx - lx) * pct2;
      const y2 = -h.rY * 1.0 - Math.sin(pct2 * Math.PI) * 35;
      
      const cx = (x1 + x2)/2 + Math.cos(Math.PI/2) * 60;
      const cy = (y1 + y2)/2 - 70;
      
      curlPoints.push({ type: 'quad', cx, cy, x: x2, y: y2 });
    }
    
    curlPoints.push({ type: 'line', x: rx, y: -h.rY * 0.45 });

    nodes.push(G.path('hair_curly', curlPoints, { 
      fill: color, stroke: '#000000', lineWidth: 5, lineJoin: 'round', close: true 
    }));

    return G.group('hair_curly_sys', null, nodes);
  }
}
