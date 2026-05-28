// B"H
/**
 * Premium player renderer.
 *
 * The Awtsmoos lets a cheap garment remain a symbol, but an expensive garment
 * may become a little human vessel: head, torso, arms, legs, walking rhythm,
 * and a yarmulke still resting on the crown. This module draws only visuals;
 * physics keeps the same honest rectangle so upgrades never become pay-to-win.
 */
export class PlayerRenderer {
  constructor() {
    this.simpleEye = '#16091f';
  }

  /**
   * Draws the player according to the equipped skin.
   * @param {CanvasRenderingContext2D} c canvas context.
   * @param {object} p player body and velocity.
   * @param {number} frame renderer frame counter.
   */
  draw(c, p, frame = 0) {
    const skin = p.skin || {};
    if (skin.realistic) this.realistic(c, p, skin, frame);
    else this.simple(c, p, skin);
  }

  /** @param {CanvasRenderingContext2D} c context @param {object} p player @param {object} s skin */
  simple(c, p, s) {
    this.rect(c, p, s.body || '#ffffff', s.trim || '#ffe28a');
    c.fillStyle = this.simpleEye;
    c.fillRect(p.x + 8, p.y + 12, 6, 6);
    c.fillRect(p.x + 21, p.y + 12, 6, 6);
    c.beginPath();
    c.arc(p.x + p.w / 2, p.y + 4, 15, Math.PI, Math.PI * 2);
    c.fillStyle = s.kippah || '#1a0b2d';
    c.fill();
  }

  /**
   * Draws an expensive animated 2D person.
   * @param {CanvasRenderingContext2D} c context.
   * @param {object} p player body.
   * @param {object} s premium skin.
   * @param {number} frame animation frame.
   */
  realistic(c, p, s, frame) {
    const moving = Math.min(1, Math.abs(p.vx || 0) / 240);
    const phase = moving ? Math.sin(frame * 0.28 + p.x * 0.035) : 0;
    const bob = moving ? Math.abs(phase) * 1.8 : 0;
    const cx = p.x + p.w / 2;
    const top = p.y + 3 + bob;
    const headY = top + 8;
    const hipY = p.y + 33;
    const footY = p.y + p.h - 2;
    const armSwing = phase * 6;
    const legSwing = phase * 7;
    c.save();
    c.lineCap = 'round';
    c.lineJoin = 'round';
    this.shadow(c, s.trim || '#ffe28a');
    this.limb(c, cx - 6, hipY, cx - 7 - legSwing, footY, s.leg || '#20182f', 5);
    this.limb(c, cx + 6, hipY, cx + 7 + legSwing, footY, s.leg || '#20182f', 5);
    this.shoe(c, cx - 7 - legSwing, footY, -1);
    this.shoe(c, cx + 7 + legSwing, footY, 1);
    this.torso(c, cx, p.y + 20 + bob, s);
    this.limb(c, cx - 10, p.y + 22 + bob, cx - 13 + armSwing, p.y + 38 + bob, s.sleeve || s.trim || '#ffe28a', 4);
    this.limb(c, cx + 10, p.y + 22 + bob, cx + 13 - armSwing, p.y + 38 + bob, s.sleeve || s.trim || '#ffe28a', 4);
    this.head(c, cx, headY, s);
    this.yarmulke(c, cx, headY - 9, s);
    c.restore();
  }

  /** @param {CanvasRenderingContext2D} c context @param {object} r rect @param {string} fill fill @param {string} stroke stroke */
  rect(c, r, fill, stroke) {
    c.fillStyle = fill;
    c.strokeStyle = stroke;
    c.lineWidth = 3;
    c.fillRect(r.x, r.y, r.w, r.h);
    c.strokeRect(r.x, r.y, r.w, r.h);
  }

  /** @param {CanvasRenderingContext2D} c context @param {string} color glow */
  shadow(c, color) {
    c.shadowColor = color;
    c.shadowBlur = 8;
  }

  /** @param {CanvasRenderingContext2D} c context @param {number} x1 start x @param {number} y1 start y @param {number} x2 end x @param {number} y2 end y @param {string} color stroke @param {number} width line width */
  limb(c, x1, y1, x2, y2, color, width) {
    c.strokeStyle = color;
    c.lineWidth = width;
    c.beginPath();
    c.moveTo(x1, y1);
    c.lineTo(x2, y2);
    c.stroke();
  }

  /** @param {CanvasRenderingContext2D} c context @param {number} x center @param {number} y center @param {object} s skin */
  torso(c, x, y, s) {
    c.fillStyle = s.body || '#f8f0ff';
    c.strokeStyle = s.trim || '#ffe28a';
    c.lineWidth = 3;
    c.beginPath();
    c.roundRect(x - 10, y - 4, 20, 22, 7);
    c.fill();
    c.stroke();
    c.fillStyle = '#ffffff55';
    c.fillRect(x - 6, y + 2, 12, 2);
  }

  /** @param {CanvasRenderingContext2D} c context @param {number} x foot x @param {number} y foot y @param {number} dir facing */
  shoe(c, x, y, dir) {
    c.fillStyle = '#100818';
    c.beginPath();
    c.ellipse(x + dir * 3, y + 1, 7, 3, 0, 0, Math.PI * 2);
    c.fill();
  }

  /** @param {CanvasRenderingContext2D} c context @param {number} x center x @param {number} y center y @param {object} s skin */
  head(c, x, y, s) {
    c.fillStyle = s.face || '#f3c49b';
    c.strokeStyle = s.trim || '#ffe28a';
    c.lineWidth = 2;
    c.beginPath();
    c.ellipse(x, y, 10, 12, 0, 0, Math.PI * 2);
    c.fill();
    c.stroke();
    c.fillStyle = '#18091f';
    c.beginPath();
    c.arc(x - 3.5, y - 1, 1.6, 0, Math.PI * 2);
    c.arc(x + 3.5, y - 1, 1.6, 0, Math.PI * 2);
    c.fill();
    c.strokeStyle = '#7a3b2b';
    c.lineWidth = 1.4;
    c.beginPath();
    c.arc(x, y + 4, 3.5, 0.1, Math.PI - 0.1);
    c.stroke();
  }

  /** @param {CanvasRenderingContext2D} c context @param {number} x center x @param {number} y cap y @param {object} s skin */
  yarmulke(c, x, y, s) {
    c.fillStyle = s.kippah || '#1a0b2d';
    c.strokeStyle = s.trim || '#ffe28a';
    c.lineWidth = 1.5;
    c.beginPath();
    c.ellipse(x, y, 8.5, 4.5, 0, Math.PI, Math.PI * 2);
    c.fill();
    c.stroke();
  }
}
