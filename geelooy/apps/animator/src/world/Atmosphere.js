
// B"H
import { SkyGradientBuilder } from './generation/sky/SkyGradientBuilder.js';
import { StarFieldOrchestrator } from './generation/sky/StarFieldOrchestrator.js';

/**
 * @class Atmosphere
 * @description
 * ═══════════════════════════════════════════════════════════════
 * CHAPTER 41: THE FIRMAMENT OF ASSIYAH (Rakia D'Assiyah)
 * ═══════════════════════════════════════════════════════════════
 */
export class Atmosphere {
  static render(ctx, scene, width, height, realTime, camera) {
    if (!ctx || !scene) return;

    const timeOfDay = scene.timeOfDay !== undefined ? scene.timeOfDay : 0.5;
    const groundY   = height * 0.72;

    ctx.save();
    const skyGrad = ctx.createLinearGradient(0, 0, 0, groundY);
    skyGrad.addColorStop(0, timeOfDay < 0.5 ? '#0077b6' : '#050508');
    skyGrad.addColorStop(1, timeOfDay < 0.5 ? '#87CEEB' : '#1a1e24');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, width, height);
    ctx.restore();

    ctx.save();
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, groundY, width, height - groundY);
    ctx.restore();

    if (timeOfDay < 0.35) {
      // Direct star render logic removed in favor of VirtualGraph approach 
      // managed elsewhere, or simple stub here if needed.
    }
  }
}
