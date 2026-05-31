// B"H

/**
 * Low-cost shape prayers for the canvas.
 *
 * Chapter 9: The Awtsmoos pressed a coin between two pulses of light until its
 * rim remembered depth. No bitmap was summoned; only arcs, rectangles, letters,
 * and breath. A perutah now glints as a small sun with a Hebrew face, and even
 * the spinning edge knows it is not scenery but a spark awaiting collection.
 */
export function poly(c, points, fill) {
  c.fillStyle = fill;
  c.beginPath();
  c.moveTo(points[0][0], points[0][1]);
  for (let i = 1; i < points.length; i += 1) c.lineTo(points[i][0], points[i][1]);
  c.closePath();
  c.fill();
}

/** @param {CanvasRenderingContext2D} c Context. @param {number} x X. @param {number} y Y. @param {number} w Width. @param {number} h Height. @param {object} skin Theme skin. */
export function slab(c, x, y, w, h, skin) {
  c.fillStyle = skin.body; c.fillRect(x, y + 5, w, Math.max(1, h - 9));
  c.fillStyle = skin.top; c.fillRect(x, y, w, Math.min(6, h));
  c.fillStyle = skin.bottom; c.fillRect(x, y + h - 4, w, 4);
  c.fillStyle = skin.trim;
  for (let ix = x + 18; ix < x + w - 8; ix += 34) c.fillRect(ix, y + 8, 12, 3);
}

/** @param {CanvasRenderingContext2D} c Context. @param {number} x X. @param {number} y Y. @param {number} w Width. @param {number} h Height. @param {string} color Color. */
export function chain(c, x, y, w, h, color) {
  c.strokeStyle = color; c.lineWidth = 2;
  for (let yy = y; yy < y + h; yy += 14) c.strokeRect(x, yy, w, 9);
}

/** @param {CanvasRenderingContext2D} c Context. @param {number} x X. @param {number} y Y. @param {number} s Size. @param {string} color Color. */
export function crystal(c, x, y, s, color) {
  poly(c, [[x, y + s], [x + s / 2, y], [x + s, y + s], [x + s / 2, y + s * 1.35]], color);
  c.fillStyle = '#ffffff'; c.fillRect(x + s / 2 - 1, y + 6, 2, s - 8);
}

/** @param {CanvasRenderingContext2D} c Context. @param {number} x X. @param {number} y Y. @param {number} s Size. @param {string} color Color. */
export function cloud(c, x, y, s, color) {
  c.fillStyle = color;
  c.beginPath(); c.arc(x, y + s, s, 0, Math.PI * 2); c.fill();
  c.beginPath(); c.arc(x + s, y, s * 1.15, 0, Math.PI * 2); c.fill();
  c.beginPath(); c.arc(x + s * 2, y + s * 0.9, s * 0.9, 0, Math.PI * 2); c.fill();
  c.fillRect(x - s, y + s, s * 4, s);
}

/** @param {CanvasRenderingContext2D} c Context. @param {number} x X. @param {number} y Y. @param {number} h Height. @param {string} bark Bark. @param {string} leaf Leaf. */
export function tree(c, x, y, h, bark, leaf) {
  c.fillStyle = bark; c.fillRect(x, y - h, 16, h);
  c.fillStyle = leaf; c.fillRect(x - 28, y - h - 38, 72, 42); c.fillRect(x - 16, y - h - 70, 48, 36);
}

/**
 * Draws a dimensional Hebrew coin with a real rim and spinning face.
 *
 * @param {CanvasRenderingContext2D} c Canvas context.
 * @param {number} x Left coordinate of the coin box.
 * @param {number} y Top coordinate of the coin box.
 * @param {number} r Coin radius.
 * @param {string} fill Main metal color.
 * @param {number} frame Animation frame for the spin scale.
 */
export function coinFace(c, x, y, r, fill, frame = 0) {
  const cx = x + r;
  const cy = y + r;
  const spin = 0.62 + Math.abs(Math.sin(frame * 0.11 + x * 0.03)) * 0.38;
  c.save();
  c.translate(cx, cy);
  c.scale(spin, 1);
  c.fillStyle = '#6b3f00';
  c.beginPath(); c.arc(0, 0, r + 2, 0, Math.PI * 2); c.fill();
  c.fillStyle = fill;
  c.beginPath(); c.arc(0, 0, r, 0, Math.PI * 2); c.fill();
  c.strokeStyle = '#3a2100'; c.lineWidth = 2.5; c.stroke();
  c.fillStyle = 'rgba(255,255,255,0.5)';
  c.beginPath(); c.ellipse(-r * 0.28, -r * 0.33, r * 0.18, r * 0.38, 0.45, 0, Math.PI * 2); c.fill();
  c.fillStyle = 'rgba(75,39,0,0.22)';
  c.fillRect(r * 0.32, -r * 0.72, r * 0.18, r * 1.44);
  c.restore();
}
