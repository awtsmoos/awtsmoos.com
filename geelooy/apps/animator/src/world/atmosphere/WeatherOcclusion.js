
// B"H
/**
 * @file WeatherOcclusion.js
 * @description
 * THE DELUGE OF Z-DEPTH (Mabul).
 * B"H
 * 
 * THE POEM OF THE GATHERED WATERS:
 * A thousand drops fell from the sky,
 * Making the mortal processor cry!
 * For every stroke of the rendering pen,
 * The engine stuttered, again and again!
 * So the Creator gathered the rain into one,
 * A single Path2D beneath the black sun!
 * The CPU rests, the frame-rate is fast,
 * As the storm of the century is perfectly cast!
 * 
 * RECTIFICATION: We now instantiate a `new Path2D()` for each layer of depth.
 * This allows the GPU to render thousands of raindrops in a single, atomic 
 * hardware call, restoring 60fps to the storm.
 */
export class WeatherOcclusion {
  /**
   * @function draw
   * @description Manifests Z-Depth sorted rain natively onto the canvas context.
   * @param {CanvasRenderingContext2D} ctx - Reality board.
   * @param {number} width - Viewport width.
   * @param {number} height - Viewport height.
   * @param {number} time - Master clock.
   * @param {number} groundY - Physical floor to calculate splashes.
   */
  static draw(ctx, width, height, time, groundY) {
    ctx.save();
    
    // Three tiers of depth: Deep (Z=0.2), Mid (Z=0.5), Fore (Z=1.0)
    const layers = [
      { count: 1000, speed: 12, length: 15, width: 0.5, alpha: 0.15, yCap: groundY - 50 },
      { count: 600, speed: 25, length: 30, width: 1.0, alpha: 0.3, yCap: groundY },
      { count: 200, speed: 45, length: 60, width: 2.0, alpha: 0.6, yCap: groundY + 40 }
    ];

    layers.forEach(layer => {
      ctx.strokeStyle = `rgba(200, 220, 255, ${layer.alpha})`;
      ctx.lineWidth = layer.width;
      
      // B"H - THE GATHERING OF WATERS INTO ONE VESSEL
      const batchPath = new Path2D();

      for (let i = 0; i < layer.count; i++) {
        // Pseudo-random distribution deterministic by time and index
        const px = (i * 73.123 + time * (layer.speed * 0.05)) % width;
        const py = (i * 101.321 + time * layer.speed) % height;
        
        batchPath.moveTo(px, py);
        batchPath.lineTo(px - (layer.speed * 0.1), py + layer.length); // Slight wind angle

        // Splash Generation ONLY on the foreground/mid layers touching the ground
        if (layer.width >= 1.0 && py > layer.yCap && py < layer.yCap + layer.speed) {
          batchPath.moveTo(px - 4, layer.yCap); batchPath.lineTo(px - 8, layer.yCap - 6);
          batchPath.moveTo(px + 4, layer.yCap); batchPath.lineTo(px + 8, layer.yCap - 6);
          batchPath.moveTo(px, layer.yCap);     batchPath.lineTo(px, layer.yCap - 10);
        }
      }
      
      // A single, glorious stroke of hardware acceleration
      ctx.stroke(batchPath);
    });

    ctx.restore();
  }
}
