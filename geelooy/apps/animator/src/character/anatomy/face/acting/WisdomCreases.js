
// B"H
import { VirtualGraph as G } from '../../../../engine/graph/VirtualGraph.js';

/**
 * @file WisdomCreases.js
 * @brief THE WRINKLES OF EXPERIENCE (Kifulei HaZman).
 * 
 * ═══════════════════════════════════════════════════════════════
 * CHAPTER: THE STORY ON THE FACE
 * ═══════════════════════════════════════════════════════════════
 * Every smile, every concern, is carved into the vessel. 
 * This module draws the "Nasolabial Folds"—lines that connect 
 * the nose to the mouth—and the "Glabella Lines" between the eyes.
 * 
 * These lines only manifest when the character's acting parameters 
 * (mouthOpen, anger, joy) surpass specific thresholds.
 */
export class WisdomCreases {
  static build(data, jawDrop) {
    const creases = [];
    
    // 1. NASOLABIAL FOLDS (Reacts to Mouth)
    const mouthWidth = (data.mouthWidth || 28);
    const intensity = Math.min(1.0, mouthWidth / 40);

    const drawFold = (side) => {
      const dir = side === 'left' ? -1 : 1;
      return G.path(`fold_${side}`, [
        { type: 'move', x: 15 * dir, y: 25 },
        { type: 'quad', cx: 25 * dir, cy: 35 + jawDrop * 0.5, x: 30 * dir, y: 55 + jawDrop }
      ], { stroke: 'rgba(0,0,0,0.1)', lineWidth: 1.5 + intensity });
    };

    creases.push(drawFold('left'), drawFold('right'));

    // 2. THE GLABELLA "11" (Reacts to anger)
    if (data.anger > 0.4) {
      creases.push(
        G.path('g1', [{type:'move', x:-4, y:-55}, {type:'line', x:-4, y:-40}], {stroke:'#000', lineWidth:1}),
        G.path('g2', [{type:'move', x:4, y:-55}, {type:'line', x:4, y:-40}], {stroke:'#000', lineWidth:1})
      );
    }

    return G.group('wisdom_lines', null, creases);
  }
}
