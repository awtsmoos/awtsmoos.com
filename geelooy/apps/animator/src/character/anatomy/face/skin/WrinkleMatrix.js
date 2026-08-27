// B"H
import { VirtualGraph as G } from '../../../../engine/graph/VirtualGraph.js';

/**
 * @file WrinkleMatrix.js
 * @description
 * THE RIPPLES OF TIME (Malchut manifesting aging).
 */
export class WrinkleMatrix {
  static build(data, profile) {
    const elements = [];
    const age = data.age || 0;
    
    // Tzimtzum mapping: wrinkles represent boundaries of light
    const style = { stroke: '#000000', lineWidth: 0.5 };
    const deepStyle = { stroke: '#000000', lineWidth: 1.0 };
    
    // Dynamic Philtrum (Above Lip)
    elements.push(G.path('philtrum_L', [{ type: 'move', x: -3, y: 12 }, { type: 'bezier', c1x: -1, c1y: 16, c2x: -2, c2y: 20, x: -6, y: 22 }], style));
    elements.push(G.path('philtrum_R', [{ type: 'move', x: 3, y: 12 }, { type: 'bezier', c1x: 1, c1y: 16, c2x: 2, c2y: 20, x: 6, y: 22 }], style));

    // Dynamic Crow's Feet (Orbicularis Oculi flex from Joy or Stress)
    const p = (val) => val * (profile.dir || 1); // Respect profile direction
    
    const squint = Math.max(data.joy || 0, data.stress || 0);
    if (squint > 0.4) {
      const ext = squint * 10;
      elements.push(G.path('crows_L1', [{ type: 'move', x: -p(30), y: -20 }, { type: 'line', x: -p(35 + ext), y: -25 }], style));
      elements.push(G.path('crows_L2', [{ type: 'move', x: -p(32), y: -18 }, { type: 'line', x: -p(37 + ext), y: -18 }], deepStyle));
      elements.push(G.path('crows_L3', [{ type: 'move', x: -p(30), y: -16 }, { type: 'line', x: -p(35 + ext), y: -11 }], style));
      
      elements.push(G.path('crows_R1', [{ type: 'move', x: p(30), y: -20 }, { type: 'line', x: p(35 + ext), y: -25 }], style));
      elements.push(G.path('crows_R2', [{ type: 'move', x: p(32), y: -18 }, { type: 'line', x: p(37 + ext), y: -18 }], deepStyle));
      elements.push(G.path('crows_R3', [{ type: 'move', x: p(30), y: -16 }, { type: 'line', x: p(35 + ext), y: -11 }], style));
    }

    if (age > 0.2) {
      const depth = age * 0.2;
      const width = age * 40;
      
      // Keter (Highest intellect lines)
      elements.push(G.path('forehead_keter', [
        {type:'move',x:-width*0.8,y:-65},
        {type:'quad', cx:0, cy:-60+age*5, x:width*0.8,y:-65}
      ], style));
      
      // Chochmah & Binah crossing lines
      if (age > 0.5) {
        elements.push(G.path('forehead_chochmah', [
          {type:'move',x:-width,y:-55},
          {type:'quad', cx:0, cy:-50+age*5, x:width,y:-55}
        ], deepStyle));
        
        elements.push(G.path('forehead_binah', [
          {type:'move',x:-width*0.9,y:-45},
          {type:'quad', cx:0, cy:-40+age*5, x:width*0.9,y:-45}
        ], style));
        
        // Between the eyebrows (Judgment / Din)
        elements.push(G.path('glabellar_din_L', [{type:'move',x:-5,y:-35}, {type:'line',x:-5,y:-25}], deepStyle));
        elements.push(G.path('glabellar_din_R', [{type:'move',x:5,y:-35}, {type:'line',x:5,y:-25}], deepStyle));
      }
      
      // Nasolabial folds (Tiferet bounded by Netzach and Hod)
      if (age > 0.7) {
        elements.push(G.path('nasolabial_L', [
          {type:'move', x:-15, y:0},
          {type:'quad', cx:-25, cy:15, x:-30, y:25}
        ], deepStyle));
        
        elements.push(G.path('nasolabial_R', [
          {type:'move', x:15, y:0},
          {type:'quad', cx:25, cy:15, x:30, y:25}
        ], deepStyle));
      }
    }
    
    return elements;
  }
}
