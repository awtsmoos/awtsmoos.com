
/* B”H */

/**
 * @class Tongue
 * @description
 * THE PEN OF THE HEART (Kulan).
 * Rolling and arching within the cavern of the mouth, the tongue 
 * forms the delicate consonants. It is organic, shaded, and profoundly 
 * alive, responding directly to the phonetic intensity of the moment.
 */
export class Tongue {
  static draw(ctx, intensity, emotion) {
    if (intensity < 0.2) return;

    // A deep, organic crimson representing the blood of life
    ctx.fillStyle = '#ff3366'; 
    ctx.strokeStyle = '#990033';
    ctx.lineWidth = 3;
    
    ctx.beginPath();
    
    // Arching logic based on specific phonetic triggers (e.g., 'L' sounds)
    if (emotion === 'L' || intensity > 0.8) {
      // Arched up, touching the roof of the mouth
      ctx.ellipse(0, 5, 20, 22, 0, Math.PI, 0);
    } else {
      // Resting at the bottom, swelling slightly
      ctx.ellipse(0, 18, 26, 14, 0, Math.PI, 0);
    }
    
    ctx.fill();
    ctx.stroke();

    // Center cleft line of the tongue for 3D realism
    ctx.beginPath();
    if (emotion === 'L' || intensity > 0.8) {
      ctx.moveTo(0, -10);
      ctx.lineTo(0, 5);
    } else {
      ctx.moveTo(0, 10);
      ctx.lineTo(0, 18);
    }
    ctx.stroke();
  }
}
