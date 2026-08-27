
/* B”H */

/**
 * @class SkyGenerator
 * @description
 * THE RACHIA (Firmament).
 * The Awtsmoos separated the upper waters from the lower waters.
 * We have removed all slow `createLinearGradient` calls. The sky is now 
 * a pure, solid expanse of color, ensuring extreme velocity in the rendering loop.
 */
export class SkyGenerator {
  static generate(ctx, width, height, timeOfDay = 0) {
    // timeOfDay: 0 (noon) to 1 (midnight)
    
    if (timeOfDay < 0.3) { 
      ctx.fillStyle = '#87CEEB'; // Pure Day
    } else if (timeOfDay < 0.6) { 
      ctx.fillStyle = '#e67e22'; // Solid Sunset
    } else { 
      ctx.fillStyle = '#000428'; // Deep Night
    }
    
    ctx.fillRect(0, 0, width, height);
    
    // Sun/Moon
    ctx.save();
    const sunX = width * 0.8;
    const sunY = height * 0.2 + (timeOfDay * height * 0.5);
    
    if (timeOfDay < 0.6) {
      // Solid Sun, no radial gradients
      ctx.fillStyle = '#FFF700';
      ctx.beginPath();
      ctx.arc(sunX, sunY, 40, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Solid Moon
      ctx.fillStyle = '#EEE';
      ctx.beginPath();
      ctx.arc(sunX, sunY, 30, 0, Math.PI * 2);
      ctx.fill();
      
      // Shadow for crescent
      ctx.fillStyle = '#000428'; 
      ctx.beginPath();
      ctx.arc(sunX + 10, sunY - 5, 25, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }
}
