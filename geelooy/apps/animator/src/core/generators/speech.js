
/* B”H */

/**
 * @class SpeechBubble
 * @description
 * THE VESSEL OF MALCHUT (Kingship/Speech). 
 * When the Awtsmoos speaks, it creates worlds. When our characters speak, 
 * we must ensure their words are bold, clear, and massive enough to be read 
 * across the infinite canvas, regardless of camera zoom.
 * 
 * The bubble dynamically measures the text and creates a perfect geometric 
 * enclosure, complete with a tail pointing to the source of the voice.
 */
export class SpeechBubble {
  static draw(ctx, x, y, text) {
    if (!text) return;
    
    ctx.save();
    
    // Massive, bold font for absolute readability
    ctx.font = '900 48px "Space Grotesk", "Inter", sans-serif';
    const metrics = ctx.measureText(text);
    const paddingX = 40;
    const paddingY = 30;
    const w = metrics.width + paddingX * 2;
    const h = 80; 
    
    // Position high above the head
    const bx = x - w / 2;
    const by = y - 380; 
    
    // The Shadow of the Word
    ctx.shadowColor = 'rgba(0,0,0,0.5)';
    ctx.shadowBlur = 20;
    ctx.shadowOffsetY = 10;

    // The Container of the Word (The Bubble)
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 6;
    ctx.lineJoin = 'round';
    
    ctx.beginPath();
    ctx.roundRect(bx, by, w, h, 25);
    ctx.fill();
    ctx.stroke();
    
    // The Channel of Emanation (The Tail)
    ctx.beginPath();
    ctx.moveTo(x - 20, by + h);
    ctx.lineTo(x, by + h + 40);
    ctx.lineTo(x + 20, by + h);
    ctx.fill();
    ctx.stroke();
    
    ctx.shadowColor = 'transparent';

    // The Divine Spark (The Text)
    ctx.fillStyle = '#000000';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, x, by + h / 2 + 5);
    
    ctx.restore();
  }
}
