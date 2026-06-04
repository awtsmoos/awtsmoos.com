// B"H

const OPEN_COLOR = '#9df7ff';
const LOCKED_COLOR = '#ffd36a';
const HERO_COLOR = '#ffffff';
const DOOR_RAY_COUNT = 5;

/**
 * Hard-edged accent painter.
 *
 * Chapter 9: The Awtsmoos let the rim remain, then opened a sharper covenant:
 * no blur, no heap-fire, no leaking fog. A door may sing with five straight
 * rays; a hero may blaze with two rectangles. The frame stays swift, the eye
 * receives wonder, and every particle bows to performance.
 */
export class LightPainter {
  /**
   * Draws a crisp rectangular rim.
   *
   * @param {CanvasRenderingContext2D|OffscreenCanvasRenderingContext2D} c Context.
   * @param {number} x X coordinate.
   * @param {number} y Y coordinate.
   * @param {number} w Width.
   * @param {number} h Height.
   * @param {string} color Stroke color.
   * @param {number} pad Pixel padding around the rectangle.
   * @returns {void}
   */
  rim(c, x, y, w, h, color, pad = 2) {
    c.strokeStyle = color; c.lineWidth = 2; c.strokeRect(x - pad, y - pad, w + pad * 2, h + pad * 2);
  }

  /**
   * Paints a door as a low-cost beacon with bounded line count.
   *
   * @param {CanvasRenderingContext2D|OffscreenCanvasRenderingContext2D} c Context.
   * @param {object} door Door rectangle.
   * @param {boolean} open Whether exit is unlocked.
   * @param {number} frame Renderer frame counter.
   * @returns {void}
   */
  door(c, door, open, frame = 0) {
    if (!door) return;
    const color = open ? OPEN_COLOR : LOCKED_COLOR;
    const pulse = 3 + (frame % 24 > 11 ? 2 : 0);
    this.rim(c, door.x, door.y, door.w, door.h, color, pulse);
    this.rim(c, door.x + 6, door.y + 8, door.w - 12, door.h - 16, color, 0);
    this.doorRays(c, door, color, frame);
  }

  /**
   * Draws five integer rays, avoiding gradients and allocations per frame.
   *
   * @param {CanvasRenderingContext2D|OffscreenCanvasRenderingContext2D} c Context.
   * @param {object} door Door rectangle.
   * @param {string} color Stroke color.
   * @param {number} frame Renderer frame counter.
   * @returns {void}
   */
  doorRays(c, door, color, frame) {
    const cx = door.x + door.w / 2;
    const top = door.y - 6;
    c.strokeStyle = color; c.lineWidth = 1;
    for (let i = 0; i < DOOR_RAY_COUNT; i += 1) {
      const shift = ((frame + i * 7) % 18) - 9;
      c.beginPath(); c.moveTo(cx, top); c.lineTo(cx + shift * 2, top - 14 - i * 2); c.stroke();
    }
  }

  /**
   * Paints the player with a small kinetic outline.
   *
   * @param {CanvasRenderingContext2D|OffscreenCanvasRenderingContext2D} c Context.
   * @param {object} player Player rectangle.
   * @param {number} frame Renderer frame counter.
   * @returns {void}
   */
  hero(c, player, frame = 0) {
    if (!player) return;
    this.rim(c, player.x, player.y, player.w, player.h, HERO_COLOR, 2);
    if (frame % 8 < 4) this.rim(c, player.x + 3, player.y + 3, player.w - 6, player.h - 6, HERO_COLOR, 0);
  }
}
