import { VirtualGraph as G } from '../../../engine/graph/VirtualGraph.js';
import { seededRandom } from '../../../utils/random.js';

/**
 * @class WindowMatrix
 * @description
 * THE EYES OF THE CITY.
 * B"H
 * 
 * RECTIFICATION: Windows no longer exist in a temporal vacuum. 
 * If timeOfDay > 0.5 (Night), they ignite with blazing yellow rectangles.
 * If timeOfDay < 0.5 (Day), they are dark, reflecting the sky.
 */
export class WindowMatrix {
  static build(w, h, seedBase, timeOfDay = 0.5) {
    const windows = [];
    const cols = Math.floor(w / 35);
    const rows = Math.floor(h / 45);
    
    const isNight = timeOfDay > 0.5;

    let seed = seedBase;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        seed += 1.2;
        const val = seededRandom(seed);
        
        // B"H - Adding a slight flicker based on time for 'living' buildings
        const flicker = Math.sin(Date.now() * 0.005 + seed) > 0.8;
        
        // At night, many windows are lit. During the day, none are lit.
        const isLit = isNight && (val > 0.6 || (val > 0.4 && flicker));

        if (isLit) {
          windows.push(G.rect(`win_${r}_${c}`, 12 + c * 35, -h + 20 + r * 45, 15, 25, { 
            fill: 'rgba(255, 240, 150, 0.95)', // Blazing warm light
            stroke: '#000', 
            lineWidth: 1 
          }));
        } else {
          windows.push(G.rect(`win_off_${r}_${c}`, 12 + c * 35, -h + 20 + r * 45, 15, 25, { 
            fill: isNight ? '#050505' : '#1a252c', // Darker at night, dark blue/gray in day
            stroke: '#000',
            lineWidth: 1
          }));
        }
      }
    }
    return G.group('window_matrix', null, windows);
  }
}