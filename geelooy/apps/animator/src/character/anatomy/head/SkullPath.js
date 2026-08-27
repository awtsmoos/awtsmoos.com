// B"H
/**
 * @file SkullPath.js
 * @description
 * THE SCHEMATIC OF SILHOUETTE.
 * B"H - Pure geometry for the human head envelope across perspectives.
 */
export class SkullPath {
  static get(view, flipX, rx, ry, jawDrop) {
    const dir = flipX ? -1 : 1;
    
    // Tzimtzum: Restrained mandible physics - amplified for dramatic expression
    const chinY = ry + (jawDrop * 0.6); 
    
    // Default Front View (and base for up/down modifying)
    if (view === 'front' || view === 'up' || view === 'down') {
      const topScale = view === 'down' ? 1.5 : (view === 'up' ? 1.2 : 1.4);
      const bottomScale = view === 'down' ? 0.6 : (view === 'up' ? 1.0 : 0.8);
      const chinOff = view === 'down' ? chinY * 0.8 : (view === 'up' ? chinY * 0.6 : chinY);
      return [
        { type: 'move', x: -rx * 0.8, y: -ry * 0.1 }, // Temple
        { type: 'bezier', c1x: -rx * 0.9, c1y: -ry * topScale, c2x: rx * 0.9, c2y: -ry * topScale, x: rx * 0.8, y: -ry * 0.1 }, // Crown
        { type: 'bezier', c1x: rx * 1.1, c1y: ry * 0.1, c2x: rx * 0.9, c2y: ry * 0.4, x: rx * 0.8, y: ry * 0.45 }, // Cheekbone out
        { type: 'bezier', c1x: rx * 0.7, c1y: ry * 0.6, c2x: rx * 0.6, c2y: chinOff * 0.8, x: rx * 0.4, y: chinOff * bottomScale * 0.9 }, // Jaw corner
        { type: 'bezier', c1x: rx * 0.2, c1y: chinOff * bottomScale * 1.1, c2x: 0, c2y: chinOff * bottomScale, x: 0, y: chinOff * bottomScale }, // Chin center R
        { type: 'bezier', c1x: 0, c1y: chinOff * bottomScale, c2x: -rx * 0.2, c2y: chinOff * bottomScale * 1.1, x: -rx * 0.4, y: chinOff * bottomScale * 0.9 }, // Chin center L
        { type: 'bezier', c1x: -rx * 0.6, c1y: chinOff * 0.8, c2x: -rx * 0.7, c2y: ry * 0.6, x: -rx * 0.8, y: ry * 0.45 }, // Jaw corner L
        { type: 'bezier', c1x: -rx * 0.9, c1y: ry * 0.4, c2x: -rx * 1.1, c2y: ry * 0.1, x: -rx * 0.8, y: -ry * 0.1 } // Cheekbone out L
      ];
    }

    // Three-Quarter: Asymmetric skull
    if (view === 'threeQuarter') {
      const farX = -rx * 0.65;
      const nearX = rx * 0.85;
      const chinX = 12 * dir;
      
      return [
        { type: 'move', x: farX, y: -ry * 0.1 },
        { type: 'bezier', c1x: farX * 1.2, c1y: -ry * 1.5, c2x: nearX * 1.1, c2y: -ry * 1.4, x: nearX * 0.9, y: -ry * 0.2 }, // Crown
        { type: 'bezier', c1x: nearX * 1.2, c1y: ry * 0.1, c2x: nearX, c2y: ry * 0.4, x: nearX * 0.85, y: ry * 0.45 }, // Cheekbone
        { type: 'bezier', c1x: nearX * 0.7, c1y: ry * 0.7, c2x: nearX * 0.4, c2y: chinY * 0.8, x: chinX + (rx * 0.2 * dir), y: chinY * 0.9 }, // Jawline
        { type: 'bezier', c1x: chinX + (rx * 0.05 * dir), c1y: chinY * 1.05, c2x: chinX - (rx * 0.1 * dir), c2y: chinY, x: chinX - (rx * 0.2 * dir), y: chinY * 0.9 }, // Chin
        { type: 'bezier', c1x: chinX - (rx * 0.6 * dir), c1y: chinY * 0.7, c2x: farX * 1.1, c2y: ry * 0.4, x: farX * 1.05, y: ry * 0.2 }, // Far jaw wrap
        { type: 'bezier', c1x: farX * 1.0, c1y: ry * 0.1, c2x: farX * 0.9, c2y: 0, x: farX, y: -ry * 0.1 } // Brow orbit return
      ];
    }

    // Side View: The Oval Deepening (High Realism Cartoon)
    if (view === 'side') {
      const backX = -rx * 1.35 * dir; // Deeper back of skull
      const faceX = rx * 0.95 * dir; // Profile boundary
      const chinX = 35 * dir;
      const browX = rx * 1.08 * dir;
      const jawCornerX = -rx * 0.4 * dir;
      
      return [
        { type: 'move', x: backX * 0.8, y: ry * 0.8 }, // Nape
        { type: 'bezier', c1x: backX * 1.2, c1y: ry * 0.3, c2x: backX * 1.2, c2y: -ry * 1.5, x: 0, y: -ry * 1.6 }, // Occipital to Crown
        { type: 'bezier', c1x: browX * 0.6, c1y: -ry * 1.6, c2x: browX, c2y: -ry * 0.8, x: browX, y: -ry * 0.4 }, // Forehead
        { type: 'bezier', c1x: browX - (10 * dir), c1y: -ry * 0.2, c2x: faceX, c2y: 0, x: faceX, y: 15 }, // Nose bridge dip
        { type: 'bezier', c1x: faceX + (5 * dir), c1y: 40, c2x: faceX - (5 * dir), c2y: chinY * 0.6, x: faceX - (10 * dir), y: chinY * 0.7 }, // Upper jaw/maxilla
        { type: 'bezier', c1x: faceX - (12 * dir), c1y: chinY * 0.9, c2x: faceX - (18 * dir), c2y: chinY, x: chinX, y: chinY }, // Chin point
        { type: 'line', x: jawCornerX, y: chinY * 0.7 }, // Strong jawline back
        { type: 'bezier', c1x: jawCornerX - (10 * dir), c1y: chinY * 0.4, c2x: backX * 0.6, c2y: ry * 0.8, x: backX * 0.8, y: ry * 0.8 } // Jaw to neck
      ];
    }

    return [];
  }
}
