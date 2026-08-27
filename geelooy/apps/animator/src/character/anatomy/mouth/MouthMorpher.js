
// B"H
import { VisemeLibrary } from './VisemeLibrary.js';

/**
 * @class MouthMorpher
 * @description
 * THE GOVERNOR OF FLUIDITY.
 * B"H
 */
export class MouthMorpher {
  static states = new Map();

  static process(id, targetViseme, view, intensity, morphParams = {}) {
    const library = VisemeLibrary.get(view);
    
    if (!this.states.has(id)) {
      this.states.set(id, { 
        currentPoints: JSON.parse(JSON.stringify(library.neutral)),
        lastView: view
      });
    }

    const state = this.states.get(id);
    if (state.lastView !== view) {
       state.currentPoints = JSON.parse(JSON.stringify(library.neutral));
       state.lastView = view;
    }

    // B"H - Ensuring BIG openings: 
    const boostedIntensity = intensity > 0.02 ? Math.max(0.3, intensity) : 0;
    
    const activeKey = boostedIntensity < 0.08 ? 'M' : (library[targetViseme] ? targetViseme : 'neutral');
    const target = library[activeKey] || library.neutral;

    const friction = 0.28; 
    
    // Apply emotional blend shapes (Smile / Frown) directly to target geometry before lerping
    const smile = morphParams.mouthSmile || 0;
    const frown = morphParams.mouthFrown || 0;
    const grimace = morphParams.mouthGrimace || 0;

    const nextPoints = state.currentPoints.map((curr, i) => {
      let tx = target[i] ? target[i].x : curr.x;
      let ty = target[i] ? target[i].y : curr.y;

      // Index Map: 0:L-Corner, 1:L-Top, 2:Center-Top, 3:R-Top, 4:R-Corner, 5:R-Bot, 6:Center-Bot, 7:L-Bot
      if (i === 0) { // Left corner
         ty -= 12 * smile; tx -= 4 * smile;
         ty += 8 * frown; tx -= 2 * frown;
         ty += 4 * grimace; tx -= 6 * grimace; // pull tight and down
      }
      if (i === 4) { // Right corner
         ty -= 12 * smile; tx += 4 * smile;
         ty += 8 * frown; tx += 2 * frown;
         ty += 4 * grimace; tx += 6 * grimace; // pull tight and down
      }
      if (i === 1) { // L-Top sneer
         ty -= 10 * grimace; // Sneer on one or both sides
      }
      if (i === 3) { // R-Top
         ty -= 12 * grimace; // Asymmetrical sneer!
      }
      if (i === 5 || i === 7) { // Bott om lips pull open slightly to show teeth
         ty += 6 * grimace;
      }
      if (i === 2 || i === 6) { // Center Top/Bot push against tension
         ty += 3 * smile;
         ty -= 3 * frown;
         ty -= 4 * grimace; // Upper lip raises in center too
      }

      return {
        x: curr.x + (tx - curr.x) * friction,
        y: curr.y + (ty - curr.y) * friction
      };
    });

    state.currentPoints = nextPoints;

    // B"H - PATH COMMAND GENERATION (4 Quads for 8 points)
    const commands = [
      { type: 'move', x: nextPoints[0].x, y: nextPoints[0].y },
      { type: 'quad', cx: nextPoints[1].x, cy: nextPoints[1].y, x: nextPoints[2].x, y: nextPoints[2].y },
      { type: 'quad', cx: nextPoints[3].x, cy: nextPoints[3].y, x: nextPoints[4].x, y: nextPoints[4].y },
      { type: 'quad', cx: nextPoints[5].x, cy: nextPoints[5].y, x: nextPoints[6].x, y: nextPoints[6].y },
      { type: 'quad', cx: nextPoints[7].x, cy: nextPoints[7].y, x: nextPoints[0].x, y: nextPoints[0].y }
    ];

    // We attach the raw transformed points to the array for consumers that need indices
    commands.raw = nextPoints;

    return commands;
  }
}
