
// B"H
import { VirtualGraph as G } from '../../../../../engine/graph/VirtualGraph.js';
import { HatBase } from '../HatBase.js';

/**
 * @class UshankaHat
 * @description
 * THE FUR CROWN (Ushanka).
 * B"H
 */
export class UshankaHat extends HatBase {
  static build(data, profile) {
    const { h, hTop, color, view, dir } = this.getParams(data, profile);
    const nodes = [];
    const pushX = (view === 'side' || view === 'threeQuarter') ? (-3 * dir) : 0;

    // 1. The Main Boxy Dome
    nodes.push(G.rect('ushanka_dome', -h.rX - 10 + pushX, hTop - 60, h.rX * 2 + 20, 80, { 
      fill: color, stroke: '#000', lineWidth: 4, radius: 10 
    }));

    // 2. The Front Flap (Folded Up) with Fur Tuft detail
    nodes.push(G.rect('ushanka_front', -h.rX + 5 + pushX, hTop - 50, h.rX * 2 - 10, 40, { 
        fill: '#eee', stroke: '#000', lineWidth: 2, radius: 5 
    }));
    
    // B"H - Fur Tufts
    for (let i = 0; i < 5; i++) {
       const fx = -h.rX + 15 + i * 25 + pushX;
       nodes.push(G.rect(`fur_tuft_${i}`, fx, hTop - 52, 10, 8, { fill: '#ddd', radius: 4 }));
    }

    // 3. Side Flaps (The "Ears")
    const flapW = 35;
    const flapH = 70;
    
    // Left Flap
    if (view !== 'side' || dir === -1) {
       nodes.push(G.rect('flap_l', -h.rX - 10 + pushX, hTop - 10, flapW, flapH, { 
           fill: color, stroke: '#000', lineWidth: 3, radius: 10 
       }));
       nodes.push(G.rect('fuzz_l', -h.rX - 5 + pushX, hTop + 10, flapW - 10, flapH - 25, { 
           fill: '#ddd', radius: 5 
       }));
       // Ear fuzz detail
       nodes.push(G.circle('ear_point_l', -h.rX - 8 + pushX, hTop + flapH - 5, 6, { fill: '#ddd' }));
    }

    // Right Flap
    if (view !== 'side' || dir === 1) {
        nodes.push(G.rect('flap_r', h.rX + 10 + pushX - flapW, hTop - 10, flapW, flapH, { 
            fill: color, stroke: '#000', lineWidth: 3, radius: 10 
        }));
        nodes.push(G.rect('fuzz_r', h.rX + 15 + pushX - flapW, hTop + 10, flapW - 10, flapH - 25, { 
            fill: '#ddd', radius: 5 
        }));
        // Ear fuzz detail
        nodes.push(G.circle('ear_point_r', h.rX + 8 + pushX, hTop + flapH - 5, 6, { fill: '#ddd' }));
    }

    return G.group('ushanka_sys', null, nodes);
  }
}
