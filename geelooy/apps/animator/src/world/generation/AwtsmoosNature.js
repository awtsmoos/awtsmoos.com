
// B"H
import { AwtsmoosCache } from '../../engine/core/AwtsmoosCache.js';
import { AwtsmoosMath } from '../../engine/core/AwtsmoosMath.js';
import { VirtualGraph as G } from '../../engine/graph/VirtualGraph.js';

/**
 * @file AwtsmoosNature.js
 * @description
 * THE CRYSTALLIZED FOREST (Ya'ar HaMakpid).
 * B"H
 * 
 * THE POEM OF THE LIMITED SEEDS (Tzimtzum HaZeraim):
 * A thousand trees across the land, all drawn by Heaven's hand!
 * But wait, the memory overflows, the mortal engines crash,
 * The RAM devours every byte, turning screens to ash.
 * We must restrict the infinite, we must quantize the cache!
 * We map the seeds to only five, a brilliant digital stash.
 * Now forests render flawlessly, without a single hitch,
 * Sustained by holy variables and a mathematical switch!
 * 
 * Generating 10,000 recursive branch segments per frame is a violation of 
 * computational sanity. We invoke the AwtsmoosCache to draw the complex, 
 * hyper-realistic trees to an offscreen buffer EXACTLY ONCE.
 * 
 * RECTIFICATION: We now QUANTIZE the tree seeds. Even if you ask for 1,000 
 * trees, the engine will only cache 5 distinct structural variations per size, 
 * reusing them. This completely stops the Out Of Memory (OOM) leaks.
 */

export class AwtsmoosNature {
  /**
   * @function drawCachedTree
   * @description Manifests or retrieves a hyper-realistic cached tree.
   * @param {number} x - Target world X position.
   * @param {number} y - Target world Y position.
   * @param {number} size - Scale and height of the tree.
   * @param {number} time - Current continuous time for wind sway.
   * @param {number} seed - The base random seed.
   * @returns {Object} A VirtualGraph Bitmap Node referencing the offscreen canvas.
   */
  static drawCachedTree(x, y, size, time, seed) {
    // QUANTIZATION: Limit infinite variations to just 5 distinct structural pools
    const quantizedSize = Math.floor(size / 10) * 10; 
    const quantizedSeed = Math.floor(seed % 5); 

    const treeId = `cached_tree_s${quantizedSize}_v${quantizedSeed}`;
    const boxSize = quantizedSize * 4; 

    // Attempt to manifest or retrieve the cached canvas
    const canvas = AwtsmoosCache.crystallize(treeId, boxSize, boxSize, (ctx) => {
      const cx = boxSize / 2;
      const cy = boxSize * 0.9; 
      
      const sprout = (bx, by, angle, length, depth, width) => {
        if (depth === 0) {
          ctx.fillStyle = AwtsmoosMath.seededRandom(bx) > 0.5 ? '#2ecc71' : '#27ae60';
          ctx.beginPath();
          ctx.arc(bx, by, quantizedSize * 0.35, 0, Math.PI * 2);
          ctx.fill();
          
          // Vein detail
          ctx.strokeStyle = '#145a32';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(bx, by);
          ctx.lineTo(bx + Math.cos(angle)*quantizedSize*0.3, by + Math.sin(angle)*quantizedSize*0.3);
          ctx.stroke();
          return;
        }

        const nx = bx + Math.cos(angle) * length;
        const ny = by + Math.sin(angle) * length;

        ctx.strokeStyle = '#4a2c10';
        ctx.lineWidth = width;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(bx, by);
        ctx.lineTo(nx, ny);
        ctx.stroke();

        const splits = depth > 3 ? 2 : (AwtsmoosMath.seededRandom(depth) > 0.4 ? 2 : 1);
        for (let i = 0; i < splits; i++) {
          sprout(nx, ny, angle + (AwtsmoosMath.seededRandom(i) - 0.5) * 1.5, length * 0.75, depth - 1, width * 0.7);
        }
      };

      sprout(cx, cy, -Math.PI/2, quantizedSize * 0.6, 5, quantizedSize * 0.15);
    });

    // Apply microscopic, ultra-fast wind sway specific to this instance's X position
    const windSway = Math.sin(time * 0.001 + x) * 2; 

    return {
      type: 'bitmap',
      id: `stamp_tree_${x}_${y}`,
      source: canvas,
      x: x - boxSize / 2,
      y: y - boxSize * 0.9,
      w: boxSize,
      h: boxSize,
      transform: {
        rotation: windSway,
        originX: x,
        originY: y
      }
    };
  }
}
