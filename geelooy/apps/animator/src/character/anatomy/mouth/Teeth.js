
/* B”H */

/**
 * @class Teeth
 * @description
 * THE WALLS OF DIN (Severity).
 * Teeth represent the boundaries that give shape to the breath.
 * Rendered with extreme realism, showing individual incisors and canines 
 * when the vessel opens wide to shout the praises of the Creator.
 */
export class Teeth {
  static draw(ctx, intensity) {
    if (intensity < 0.15) return;

    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;

    const width = 50;
    const height = 8 + (intensity * 12);

    // Upper Teeth (Descend from the heavens)
    ctx.beginPath();
    ctx.roundRect(-width/2, -25, width, height, [0, 0, 5, 5]);
    ctx.fill();
    ctx.stroke();

    // Enamel Separation Lines (The individual letters of Din)
    for (let i = -width/2 + 8; i < width/2; i += 8) {
      ctx.beginPath();
      ctx.moveTo(i, -25);
      ctx.lineTo(i, -25 + height - 2);
      ctx.stroke();
    }

    // Lower Teeth (Only visible in intense, wide-open states like 'A' or 'E')
    if (intensity > 0.6) {
      ctx.beginPath();
      ctx.roundRect(-width/2 + 5, 20 - (intensity * 5), width - 10, 10, [5, 5, 0, 0]);
      ctx.fill();
      ctx.stroke();

      for (let i = -width/2 + 10; i < width/2 - 5; i += 8) {
        ctx.beginPath();
        ctx.moveTo(i, 20 - (intensity * 5) + 2);
        ctx.lineTo(i, 30 - (intensity * 5));
        ctx.stroke();
      }
    }
  }
}
