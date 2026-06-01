// B"H
/**
 * Player renderer of honest hard shapes.
 *
 * Chapter 16: The Awtsmoos gave the climber weight without blur. Knees swing,
 * shoulders lean, the body compresses on ground, and the feet bite the world
 * with two black rectangles. The player is still only rectangles, circles,
 * polygons, and lines, yet the silhouette now breathes like a living vessel.
 */
export class PlayerRenderer {
  constructor() { this.eye = '#16091f'; }

  /** @param {CanvasRenderingContext2D} c Context. @param {object} p Player body. @param {number} frame Animation frame. */
  draw(c, p, frame = 0) {
    const skin = p.skin || {}, moving = Math.min(1, Math.abs(p.vx || 0) / 240), airborne = !p.on;
    const phase = moving ? Math.sin(frame * 0.28 + p.x * 0.035) : Math.sin(frame * 0.055) * 0.16;
    const lean = Math.max(-1, Math.min(1, (p.vx || 0) / 280)) * (airborne ? 4 : 3);
    const squash = p.on ? 2 - moving : -2;
    if (skin.realistic) this.alive(c, p, skin, phase, lean, squash, moving, airborne);
    else this.simple(c, p, skin, phase, lean, squash);
  }

  simple(c, p, s, phase, lean, squash) {
    this.body(c, p.x + lean, p.y + squash, p.w, p.h - squash, s.body || '#ffffff', s.trim || '#ffe28a');
    this.eyes(c, p.x + lean, p.y + squash); this.kippah(c, p.x + p.w / 2 + lean, p.y + 5 + squash, s);
    this.feet(c, p.x + p.w / 2, p.y + p.h, phase);
  }

  alive(c, p, s, phase, lean, squash, moving, airborne) {
    const cx = p.x + p.w / 2, headY = p.y + 12 + squash, shoulderY = p.y + 24 + squash, hipY = p.y + 35, footY = p.y + p.h;
    const arm = phase * 7 * (moving || 0.35), leg = phase * 8 * (moving || 0.25), lift = airborne ? 5 : 0;
    c.save(); c.lineCap = 'round'; c.lineJoin = 'round';
    this.limb(c, cx - 6 + lean, hipY, cx - 8 - leg, footY - lift, s.leg || '#20182f', 5);
    this.limb(c, cx + 6 + lean, hipY, cx + 8 + leg, footY + lift * 0.4, s.leg || '#20182f', 5);
    this.feet(c, cx, footY, phase);
    this.torso(c, cx + lean, shoulderY, s, squash);
    this.limb(c, cx - 10 + lean, shoulderY, cx - 15 + arm, shoulderY + 16, s.sleeve || s.trim || '#ffe28a', 4);
    this.limb(c, cx + 10 + lean, shoulderY, cx + 15 - arm, shoulderY + 16, s.sleeve || s.trim || '#ffe28a', 4);
    this.head(c, cx + lean, headY, s); this.kippah(c, cx + lean, headY - 9, s); c.restore();
  }

  body(c, x, y, w, h, fill, stroke) { c.fillStyle = fill; c.strokeStyle = stroke; c.lineWidth = 3; c.fillRect(x, y, w, h); c.strokeRect(x, y, w, h); }
  limb(c, x1, y1, x2, y2, color, width) { c.strokeStyle = color; c.lineWidth = width; c.beginPath(); c.moveTo(x1, y1); c.lineTo(x2, y2); c.stroke(); }

  torso(c, x, y, s, squash) {
    c.fillStyle = s.body || '#f8f0ff'; c.strokeStyle = s.trim || '#ffe28a'; c.lineWidth = 3;
    c.beginPath(); c.moveTo(x - 11, y - 5); c.lineTo(x + 11, y - 5); c.lineTo(x + 9, y + 18 - squash); c.lineTo(x - 9, y + 18 - squash); c.closePath(); c.fill(); c.stroke();
    c.fillStyle = '#ffffff'; c.fillRect(x - 6, y + 2, 12, 2);
  }

  feet(c, x, y, phase) { c.fillStyle = '#100818'; c.fillRect(x - 17 - phase * 2, y - 3, 13, 5); c.fillRect(x + 4 + phase * 2, y - 3, 13, 5); }

  head(c, x, y, s) {
    c.fillStyle = s.face || '#f3c49b'; c.strokeStyle = s.trim || '#ffe28a'; c.lineWidth = 2;
    c.beginPath(); c.arc(x, y, 10, 0, Math.PI * 2); c.fill(); c.stroke();
    c.fillStyle = this.eye; c.beginPath(); c.arc(x - 3.5, y - 1, 1.6, 0, Math.PI * 2); c.arc(x + 3.5, y - 1, 1.6, 0, Math.PI * 2); c.fill();
    c.strokeStyle = '#7a3b2b'; c.lineWidth = 1.4; c.beginPath(); c.arc(x, y + 4, 3.5, 0.1, Math.PI - 0.1); c.stroke();
  }

  eyes(c, x, y) { c.fillStyle = this.eye; c.fillRect(x + 8, y + 12, 6, 6); c.fillRect(x + 21, y + 12, 6, 6); }

  kippah(c, x, y, s) {
    c.fillStyle = s.kippah || '#1a0b2d'; c.strokeStyle = s.trim || '#ffe28a'; c.lineWidth = 1.5;
    c.beginPath(); c.arc(x, y, 8.5, Math.PI, Math.PI * 2); c.lineTo(x - 8.5, y); c.fill(); c.stroke();
  }
}
