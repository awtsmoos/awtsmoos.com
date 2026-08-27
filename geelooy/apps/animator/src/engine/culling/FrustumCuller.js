
// B"H
import { CameraBounds } from './CameraBounds.js';
import { BoundingBox } from './BoundingBox.js';

/**
 * @class FrustumCuller
 * @description
 * THE LIMITS OF SIGHT (Gvul HaRe'iyah).
 * B"H
 * 
 * The Awtsmoos sees all, but the human browser cannot. Attempting to render 
 * 5000 blades of grass that are currently 10,000 pixels off-screen destroys 
 * the CPU. This engine compares object bounding boxes against the Camera bounds 
 * and flags them as 'skip: true' if they are outside the lens.
 */
export class FrustumCuller {
  static cull(sceneData, ctxWidth, ctxHeight, camera) {
    if (!sceneData) return;

    const bounds = CameraBounds.calculate(camera, ctxWidth, ctxHeight);
    // Expand bounds slightly to prevent popping at edges
    bounds.x1 -= 200; bounds.x2 += 200;
    bounds.y1 -= 200; bounds.y2 += 200;

    const cullArray = (arr, parallax = 1.0) => {
      if (!arr) return;
      arr.forEach(item => {
        // Adjust for parallax: things in back move slower relative to camera
        const ix = item.x;
        const w = item.w || item.size || 100;
        
        // Very simplified AABB check against X axis
        const inView = (ix + w > bounds.x1 * parallax) && (ix - w < bounds.x2 * parallax);
        item._culled = !inView;
      });
    };

    cullArray(sceneData.foliage, 1.0);
    cullArray(sceneData.buildings, 0.5);
    cullArray(sceneData.mountains, 0.1);
  }
}
