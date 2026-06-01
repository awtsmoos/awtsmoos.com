// B"H

/**
 * Low-cost shape prayers for the canvas.
 *
 * Chapter 11: The Awtsmoos pressed worlds through the narrow gate of hard
 * geometry. No image entered, no gradient whispered, no blur pretended to be
 * depth. Rectangles became fortress stones, circles became axles, triangles
 * became teeth, and Hebrew letters sat on coins like tiny suns of command.
 */
export function poly(c, points, fill) {
  c.fillStyle = fill;
  c.beginPath(); c.moveTo(points[0][0], points[0][1]);
  for (let i = 1; i < points.length; i += 1) c.lineTo(points[i][0], points[i][1]);
  c.closePath(); c.fill();
}

/** Draws a collision-sincere slab with clear top, mass, bottom, and brick marks. */
export function slab(c, x, y, w, h, skin) {
  c.fillStyle = skin.body; c.fillRect(x, y + 5, w, Math.max(1, h - 9));
  c.fillStyle = skin.top; c.fillRect(x, y, w, Math.min(6, h));
  c.fillStyle = skin.bottom; c.fillRect(x, y + h - 4, w, 4);
  c.fillStyle = skin.trim;
  for (let ix = x + 14; ix < x + w - 8; ix += 34) c.fillRect(ix, y + 9, 14, 3);
  c.fillStyle = 'rgba(0,0,0,0.35)';
  for (let ix = x + 31; ix < x + w - 10; ix += 52) c.fillRect(ix, y + 14, 2, Math.max(2, h - 20));
}

/** Draws a deceptive platform: similar vocabulary, visibly broken grammar. */
export function falseSlab(c, x, y, w, h, skin, kind = 'phantom') {
  c.fillStyle = skin.fake || skin.body; c.fillRect(x, y + 6, w, Math.max(1, h - 10));
  c.fillStyle = kind === 'falseSpike' || kind === 'ghostSpike' ? '#f4d1d1' : skin.trim;
  for (let ix = x + 5; ix < x + w - 8; ix += 18) c.fillRect(ix, y + 2 + ((ix / 18) % 2) * 4, 10, 2);
  c.fillStyle = '#090609';
  for (let ix = x + 12; ix < x + w - 8; ix += 28) poly(c, [[ix, y + h], [ix + 7, y + h - 8], [ix + 14, y + h]], '#090609');
  if (kind === 'phantom') { c.fillStyle = '#ffffff'; c.fillRect(x + 6, y + 4, w - 12, 2); }
}

/** Draws a hanging chain from small rectangles only. */
export function chain(c, x, y, w, h, color) {
  c.strokeStyle = color; c.lineWidth = 2;
  for (let yy = y; yy < y + h; yy += 14) c.strokeRect(x, yy, w, 9);
}

/** Draws a banner with hard cloth cuts. */
export function banner(c, x, y, w, h, color, trim) {
  c.fillStyle = color; c.fillRect(x, y, w, h);
  poly(c, [[x, y + h], [x + w / 2, y + h - 12], [x + w, y + h]], '#080507');
  c.fillStyle = trim; c.fillRect(x + 4, y + 5, w - 8, 3);
}

/** Draws crystal architecture from polygons and center cuts. */
export function crystal(c, x, y, s, color, trim = '#ffffff') {
  poly(c, [[x, y + s], [x + s / 2, y], [x + s, y + s], [x + s / 2, y + s * 1.35]], color);
  c.fillStyle = trim; c.fillRect(x + s / 2 - 1, y + 6, 2, s - 8);
}

/** Draws a rectangular cloud/flood shape using circles and a base. */
export function cloud(c, x, y, s, color) {
  c.fillStyle = color;
  c.beginPath(); c.arc(x, y + s, s, 0, Math.PI * 2); c.fill();
  c.beginPath(); c.arc(x + s, y, s * 1.15, 0, Math.PI * 2); c.fill();
  c.beginPath(); c.arc(x + s * 2, y + s * 0.9, s * 0.9, 0, Math.PI * 2); c.fill();
  c.fillRect(x - s, y + s, s * 4, s);
}

/** Draws a tree as a readable sanctuary column. */
export function tree(c, x, y, h, bark, leaf) {
  c.fillStyle = bark; c.fillRect(x, y - h, 16, h);
  c.fillStyle = leaf; c.fillRect(x - 28, y - h - 38, 72, 42); c.fillRect(x - 16, y - h - 70, 48, 36);
}

/** Draws an arch/ruin block from rectangles and a cutout color. */
export function arch(c, x, y, w, h, fill, voidColor, trim) {
  c.fillStyle = fill; c.fillRect(x, y, w, h); c.fillStyle = voidColor;
  c.fillRect(x + w * 0.28, y + h * 0.44, w * 0.44, h * 0.56);
  c.beginPath(); c.arc(x + w / 2, y + h * 0.44, w * 0.22, Math.PI, Math.PI * 2); c.fill();
  c.fillStyle = trim; c.fillRect(x, y, w, 4); c.fillRect(x + 6, y + 12, w - 12, 3);
}

/** Draws a dimensional Hebrew coin with a rim, face, and visible symbol. */
export function coinFace(c, x, y, r, fill, frame = 0, label = '₪', fake = false) {
  const cx = x + r, cy = y + r, spin = 0.72 + Math.abs(Math.sin(frame * 0.11 + x * 0.03)) * 0.28;
  c.save(); c.translate(cx, cy); c.scale(spin, 1);
  c.fillStyle = fake ? '#3b2332' : '#6b3f00'; c.beginPath(); c.arc(0, 0, r + 2, 0, Math.PI * 2); c.fill();
  c.fillStyle = fill; c.beginPath(); c.arc(0, 0, r, 0, Math.PI * 2); c.fill();
  c.strokeStyle = fake ? '#ffffff' : '#3a2100'; c.lineWidth = 2.5; c.stroke();
  c.fillStyle = fake ? '#ffffff' : '#14081f'; c.font = `900 ${Math.max(12, r)}px serif`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(label, 0, 1);
  if (fake) { c.fillRect(-r * 0.7, -2, r * 1.4, 3); c.fillRect(r * 0.22, -r * 0.72, 3, r * 1.44); }
  c.restore(); c.textAlign = 'start'; c.textBaseline = 'alphabetic';
}
