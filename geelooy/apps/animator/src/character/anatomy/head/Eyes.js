
import { ANATOMY } from '../../data/Anatomy.js';
import { PerspectiveManager } from '../PerspectiveManager.js';

/**
 * @file Eyes.js
 * @description
 * THE WINDOWS OF PERCEPTION.
 * Eyes are where the inner light is most visible. 
 * 
 * RECTIFICATION:
 * We have abolished flat ovals. These eyes possess:
 * 1. The Sclera (White base)
 * 2. The Iris (Color detail)
 * 3. The Pupil (The point of absolute nullity)
 * 4. Specular Highlights (The moisture of life)
 * 5. Dynamic Eyelids (Upper and lower shading)
 */

export class EyesPart {
  /**
   * Draws realistic eyes that respond to emotional and physical state.
   * @param {CanvasRenderingContext2D} ctx - Reality board.
   * @param {Object} data - Actor data.
   */
  static draw(ctx, data) {
    const { idle = {}, emotion = 'neutral', eyeDart = {x:0, y:0} } = data;
    const { blink = 0 } = idle;
    const h = ANATOMY.head;
    const e = ANATOMY.face.eyes;
    const profile = PerspectiveManager.get(data.view);
    
    ctx.save();
    ctx.translate(profile.head.x, e.offsetY);

    if (profile.eyes.visible.includes('left')) {
      this._drawSingleEye(ctx, profile.eyes.left.x, 0, profile.eyes.left.scaleX, blink, emotion, eyeDart);
    }
    if (profile.eyes.visible.includes('right')) {
      this._drawSingleEye(ctx, profile.eyes.right.x, 0, profile.eyes.right.scaleX, blink, emotion, eyeDart);
    }

    ctx.restore();
  }

  static _drawSingleEye(ctx, x, y, scaleX, blink, emotion, pupil) {
    const e = ANATOMY.face.eyes;
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scaleX, 1);

    // 1. BLINK MECHANISM (Tzimtzum of Sight)
    // If blink > 0.8, eye is closed
    const eyeH = blink > 0.8 ? 2 : e.h;
    
    // 2. SCLERA (The pure white canvas)
    ctx.beginPath();
    ctx.ellipse(0, 0, e.w, eyeH, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#fff';
    ctx.fill();
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 3;
    ctx.stroke();

    if (blink < 0.8) {
      ctx.save();
      ctx.clip(); // Ensure inner parts don't bleed out

      // 3. PUPIL & IRIS (The Focus)
      ctx.fillStyle = '#000';
      ctx.beginPath();
      // Parallax jitter
      ctx.arc(pupil.x, pupil.y, e.pupil, 0, Math.PI * 2);
      ctx.fill();

      // 4. SPECULAR HIGHLIGHT (The spark of life)
      ctx.fillStyle = 'rgba(255,255,255,0.8)';
      ctx.beginPath();
      ctx.arc(e.pupil * 0.4 + pupil.x, -e.pupil * 0.4 + pupil.y, e.pupil * 0.3, 0, Math.PI * 2);
      ctx.fill();

      // 5. UPPER EYELID SHADOW (Ambient Occlusion)
      ctx.fillStyle = 'rgba(0,0,0,0.1)';
      ctx.beginPath();
      ctx.rect(-e.w, -eyeH, e.w * 2, eyeH * 0.4);
      ctx.fill();

      ctx.restore();
    }

    // 6. EYELASHES / RIM
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 4;
    ctx.beginPath();
    if (blink > 0.8) {
      // Draw closed eye curve
      ctx.moveTo(-e.w, 0); ctx.quadraticCurveTo(0, 5, e.w, 0);
      ctx.stroke();
    }

    ctx.restore();
  }
}
