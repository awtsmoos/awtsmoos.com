
/* B”H */

/**
 * @class WorldEntities
 * @description
 * THE ALPHABET OF NATURE.
 * A profound JSON-driven system to generate extreme 2D background elements.
 * Rather than hardcoded trees, this system takes generic JSON arrays (groups)
 * composed of emojis, primitives, and text, and draws them to the screen.
 * This makes the world fully editable in real-time.
 */
export class WorldEntities {
  static renderGroup(ctx, group) {
    if (!group || !group.items) return;

    ctx.save();
    ctx.translate(group.x || 0, group.y || 0);
    ctx.scale(group.scale || 1, group.scale || 1);

    group.items.forEach(item => {
      ctx.save();
      ctx.translate(item.x || 0, item.y || 0);
      
      if (item.type === 'emoji') {
        this.drawEmoji(ctx, item);
      } else if (item.type === 'rect') {
        this.drawRect(ctx, item);
      } else if (item.type === 'circle') {
        this.drawCircle(ctx, item);
      }
      
      ctx.restore();
    });

    ctx.restore();
  }

  static drawEmoji(ctx, item) {
    ctx.font = `${item.size || 50}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(item.char, 0, 0);
  }

  static drawRect(ctx, item) {
    ctx.fillStyle = item.color || '#fff';
    ctx.fillRect(-item.w/2, -item.h/2, item.w, item.h);
    if (item.border) {
      ctx.strokeStyle = item.borderColor || '#000';
      ctx.lineWidth = item.borderWidth || 2;
      ctx.strokeRect(-item.w/2, -item.h/2, item.w, item.h);
    }
  }

  static drawCircle(ctx, item) {
    ctx.fillStyle = item.color || '#fff';
    ctx.beginPath();
    ctx.arc(0, 0, item.r || 25, 0, Math.PI * 2);
    ctx.fill();
    if (item.border) {
      ctx.strokeStyle = item.borderColor || '#000';
      ctx.lineWidth = item.borderWidth || 2;
      ctx.stroke();
    }
  }
}
