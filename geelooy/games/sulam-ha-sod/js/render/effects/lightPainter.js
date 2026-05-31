// B"H

/**
 * Hard-edged accent painter.
 *
 * Chapter 9: The Awtsmoos let the rim remain, but stripped away the last veil
 * of translucent haze. A door and a hero can be readable by two clean lines.
 * The canvas needs no glow to tell the truth.
 */
export class LightPainter {
  /** @param {CanvasRenderingContext2D} c Context. @param {number} x X. @param {number} y Y. @param {number} w Width. @param {number} h Height. @param {string} color Stroke color. */
  rim(c, x, y, w, h, color) {
    c.strokeStyle = color; c.lineWidth = 2; c.strokeRect(x - 2, y - 2, w + 4, h + 4);
  }

  /** @param {CanvasRenderingContext2D} c Context. @param {object} door Door. @param {boolean} open Open state. */
  door(c, door, open) { if (door) this.rim(c, door.x, door.y, door.w, door.h, open ? '#9df7ff' : '#ffd36a'); }

  /** @param {CanvasRenderingContext2D} c Context. @param {object} player Player. */
  hero(c, player) { if (player) this.rim(c, player.x, player.y, player.w, player.h, '#ffffff'); }
}
