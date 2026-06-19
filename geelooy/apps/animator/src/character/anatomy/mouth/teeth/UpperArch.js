
import { VirtualGraph as G } from '../../../../engine/graph/VirtualGraph.js';

/**
 * @class UpperArch
 * @description
 * THE HEAVENLY PILLARS OF SPEECH (Maxilla).
 * B"H
 * 
 * Manages the upper dentition with absolute geometric severity.
 * Introduces "Gingival Scalloping" (wavy gums) and dedicated "Canine" paths.
 * 
 * @author Chariot of the Awtsmoos
 */
export class UpperArch {
  /**
   * Manifests the upper gums and teeth.
   * @param {number} intensity - Vocal energy.
   * @param {number} w - Full width constraint.
   */
  static build(intensity, w) {
    const nodes = [];

    // --- 1. GINGIVAL SCALLOPING (The Wavy Gums) ---
    // Only drop down to reveal gums during extreme intensity laughs/shouts.
    if (intensity > 0.4) {
      const gumPath = [{ type: 'move', x: -w, y: -26 }];
      // Scalloped arches dipping between the tooth roots
      for (let i = -w; i < w; i += 6) {
        gumPath.push({ type: 'quad', cx: i + 3, cy: -12 + (intensity * 5), x: i + 6, y: -22 });
      }
      gumPath.push(
        { type: 'line', x: w, y: -38 },
        { type: 'line', x: -w, y: -38 }
      );

      nodes.push(G.path('upper_gums', gumPath, { 
        fill: '#ff85a2', 
        stroke: '#a03050', 
        lineWidth: 2, 
        lineJoin: 'round' 
      }));
    }

    // --- 2. UPPER TEETH BASE ---
    // Pushes down into view slightly more upon harder articulation
    const topAnchor = -22;
    const botAnchor = -12 + (intensity * 6);
    
    const upperBase = G.path('upper_teeth_base', [
      { type: 'move', x: -w, y: topAnchor },
      { type: 'quad', cx: 0, cy: botAnchor + 3, x: w, y: topAnchor },
      { type: 'line', x: w, y: -40 },
      { type: 'line', x: -w, y: -40 }
    ], { fill: '#ffffff', stroke: '#000000', lineWidth: 3, lineJoin: 'round' });
    
    nodes.push(upperBase);

    // --- 3. ENAMEL SEPARATION (Incisors & Premolars) ---
    // The central gap (0) gets a slightly longer tooth base to show front teeth dominance.
    const gaps = [-26, -18, -8, 0, 8, 18, 26];
    gaps.forEach(gx => {
      // The closer to 0, the lower the tooth dips
      const centerDip = Math.max(0, 4 - Math.abs(gx) / 4);
      nodes.push(G.path(`tooth_gap_u_${gx}`, [
        { type: 'move', x: gx, y: topAnchor },
        { type: 'line', x: gx, y: botAnchor + centerDip } 
      ], { stroke: '#d4d4d4', lineWidth: 2 }));
    });

    // --- 4. CANINE PROTRUSIONS (Sharp geometries) ---
    const canineL = G.path('canine_l', [
      { type: 'move', x: -18, y: topAnchor + 2 },
      { type: 'line', x: -16, y: botAnchor + 4 }, // Sharp point down
      { type: 'line', x: -13, y: topAnchor + 2 }
    ], { fill: '#ffffff', stroke: '#000000', lineWidth: 2, lineJoin: 'round' });
    
    const canineR = G.path('canine_r', [
      { type: 'move', x: 13, y: topAnchor + 2 },
      { type: 'line', x: 16, y: botAnchor + 4 }, // Sharp point down
      { type: 'line', x: 18, y: topAnchor + 2 }
    ], { fill: '#ffffff', stroke: '#000000', lineWidth: 2, lineJoin: 'round' });

    nodes.push(canineL, canineR);

    return nodes;
  }
}
