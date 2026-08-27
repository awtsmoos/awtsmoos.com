
import { VirtualGraph as G } from '../../../engine/graph/VirtualGraph.js';

/**
 * @class PropGenerator
 * @description
 * THE INANIMATE VESSELS (Domem).
 * B"H
 * Exquisitely detailed plates, forks, and a fully functional nested picture frame.
 */
export class PropGenerator {
  
  static plate(x, y) {
    return G.group(`plate_${x}`, { x, y }, [
      G.ellipse('p_outer', 0, 0, 35, 12, 0, { fill: '#fff', stroke: '#ddd', lineWidth: 2 }),
      G.ellipse('p_inner', 0, 0, 25, 8, 0, { stroke: '#eee', lineWidth: 2 })
    ]);
  }

  static fork(x, y) {
    return G.group(`fork_${x}`, { x, y, rotation: 15 }, [
      G.path('f_handle', [
        { type: 'move', x: 0, y: 0 },
        { type: 'line', x: 0, y: -25 },
        { type: 'quad', cx: 10, cy: -30, x: 10, y: -45 },
        { type: 'move', x: 10, y: -30 },
        { type: 'line', x: 5, y: -45 },
        { type: 'move', x: 10, y: -30 },
        { type: 'line', x: 0, y: -45 },
        { type: 'move', x: 10, y: -30 },
        { type: 'line', x: 15, y: -45 }
      ], { stroke: '#cccccc', lineWidth: 2, lineCap: 'round' })
    ]);
  }

  /**
   * The Holy Frame. Contains a miniature universe through a clipping mask.
   */
  static pictureFrame(x, y, w, h, sceneColor = '#87CEEB') {
    const artContent = [
      // Base Sky Fill (Expanded beyond bounds to ensure total coverage inside clip)
      G.rect('art_sky', -w, -h, w*2, h*2, { fill: sceneColor }),
      // Sun
      G.circle('art_sun', w*0.3, -h*0.2, 15, { fill: '#ffd700' }),
      // Mountains
      G.path('art_mountains', [
        { type: 'move', x: -w/2, y: h/2 },
        { type: 'line', x: -w/4, y: 0 },
        { type: 'line', x: 0, y: h/2 },
        { type: 'line', x: w/4, y: -h/4 },
        { type: 'line', x: w/2, y: h/2 }
      ], { fill: '#34495e' })
    ];

    const clipRect = [
      { type: 'move', x: -w/2, y: -h/2 },
      { type: 'line', x: w/2, y: -h/2 },
      { type: 'line', x: w/2, y: h/2 },
      { type: 'line', x: -w/2, y: h/2 }
    ];

    return G.group(`frame_${x}`, { x, y }, [
      // Frame backing/border
      G.rect('f_wood', -w/2 - 10, -h/2 - 10, w + 20, h + 20, { fill: '#4a2b10', stroke: '#000', lineWidth: 4 }),
      // The Universe within
      G.clip('f_art', null, clipRect, artContent),
      // Glass sheen
      G.path('f_glass', [
        { type: 'move', x: w/2 - 5, y: -h/2 + 5 }, { type: 'line', x: -w/2 + 5, y: h/2 - 5 }
      ], { stroke: 'rgba(255,255,255,0.3)', lineWidth: 3 })
    ]);
  }
}
