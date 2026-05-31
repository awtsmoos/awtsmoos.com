// B"H
/**
 * Player renderer of honest hard shapes.
 *
 * Chapter 8: The Awtsmoos removed the last soft halo from the climber. The
 * player remains readable through simple marks: body, eyes, crown, limbs, and
 * rhythm. No blur is needed for dignity; a clean silhouette is enough.
 */
export class PlayerRenderer {
  constructor() { this.simpleEye = '#16091f'; }

  /** @param {CanvasRenderingContext2D} c Context. @param {object} p Player body. @param {number} frame Animation frame. */
  draw(c, p, frame = 0) {
    const skin = p.skin || {};
    if (skin.realistic) this.realistic(c, p, skin, frame);
    else this.simple(c, p, skin);
  }

  simple(c, p, s) {
    this.rect(c, p, s.body || '#ffffff', s.trim || '#ffe28a');
    c.fillStyle = this.simpleEye; c.fillRect(p.x + 8, p.y + 12, 6, 6); c.fillRect(p.x + 21, p.y + 12, 6, 6);
    c.beginPath(); c.arc(p.x + p.w / 2, p.y + 4, 15, Math.PI, Math.PI * 2); c.fillStyle = s.kippah || '#1a0b2d'; c.fill();
  }

  realistic(c, p, s, frame) {
    const moving = Math.min(1, Math.abs(p.vx || 0) / 240);
    const phase = moving ? Math.sin(frame * 0.28 + p.x * 0.035) : 0;
    const bob = moving ? Math.abs(phase) * 1.8 : 0, cx = p.x + p.w / 2, top = p.y + 3 + bob;
    const headY = top + 8, hipY = p.y + 33, footY = p.y + p.h - 2, armSwing = phase * 6, legSwing = phase * 7;
    c.save(); c.lineCap = 'round'; c.lineJoin = 'round';
    this.limb(c, cx - 6, hipY, cx - 7 - legSwing, footY, s.leg || '#20182f', 5);
    this.limb(c, cx + 6, hipY, cx + 7 + legSwing, footY, s.leg || '#20182f', 5);
    this.shoe(c, cx - 7 - legSwing, footY, -1); this.shoe(c, cx + 7 + legSwing, footY, 1);
    this.torso(c, cx, p.y + 20 + bob, s);
    this.limb(c, cx - 10, p.y + 22 + bob, cx - 13 + armSwing, p.y + 38 + bob, s.sleeve || s.trim || '#ffe28a', 4);
    this.limb(c, cx + 10, p.y + 22 + bob, cx + 13 - armSwing, p.y + 38 + bob, s.sleeve || s.trim || '#ffe28a', 4);
    this.head(c, cx, headY, s); this.yarmulke(c, cx, headY - 9, s); c.restore();
  }

  rect(c, r, fill, stroke) { c.fillStyle = fill; c.strokeStyle = stroke; c.lineWidth = 3; c.fillRect(r.x, r.y, r.w, r.h); c.strokeRect(r.x, r.y, r.w, r.h); }
  limb(c, x1, y1, x2, y2, color, width) { c.strokeStyle = color; c.lineWidth = width; c.beginPath(); c.moveTo(x1, y1); c.lineTo(x2, y2); c.stroke(); }

  torso(c, x, y, s) {
    c.fillStyle = s.body || '#f8f0ff'; c.strokeStyle = s.trim || '#ffe28a'; c.lineWidth = 3;
    c.beginPath(); c.roundRect(x - 10, y - 4, 20, 22, 7); c.fill(); c.stroke();
    c.fillStyle = '#ffffff'; c.fillRect(x - 6, y + 2, 12, 2);
  }

  shoe(c, x, y, dir) { c.fillStyle = '#100818'; c.beginPath(); c.ellipse(x + dir * 3, y + 1, 7, 3, 0, 0, Math.PI * 2); c.fill(); }

  head(c, x, y, s) {
    c.fillStyle = s.face || '#f3c49b'; c.strokeStyle = s.trim || '#ffe28a'; c.lineWidth = 2;
    c.beginPath(); c.ellipse(x, y, 10, 12, 0, 0, Math.PI * 2); c.fill(); c.stroke();
    c.fillStyle = '#18091f'; c.beginPath(); c.arc(x - 3.5, y - 1, 1.6, 0, Math.PI * 2); c.arc(x + 3.5, y - 1, 1.6, 0, Math.PI * 2); c.fill();
    c.strokeStyle = '#7a3b2b'; c.lineWidth = 1.4; c.beginPath(); c.arc(x, y + 4, 3.5, 0.1, Math.PI - 0.1); c.stroke();
  }

  yarmulke(c, x, y, s) {
    c.fillStyle = s.kippah || '#1a0b2d'; c.strokeStyle = s.trim || '#ffe28a'; c.lineWidth = 1.5;
    c.beginPath(); c.ellipse(x, y, 8.5, 4.5, 0, Math.PI, Math.PI * 2); c.fill(); c.stroke();
  }
}
