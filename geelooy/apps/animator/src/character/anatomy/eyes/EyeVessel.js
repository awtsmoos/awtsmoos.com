
// B"H
import { VirtualGraph as G } from '../../../engine/graph/VirtualGraph.js';
import { ScleraPath } from './ScleraPath.js';
import { PupilRenderer } from './PupilRenderer.js';
import { EyelidRenderer } from './EyelidRenderer.js';
import { ScleraVessel } from './sclera/ScleraVessel.js';
import { CrowsFeetRenderer } from './expressions/CrowsFeetRenderer.js';
import { FurrowRenderer } from './expressions/FurrowRenderer.js';
import { FatigueRenderer } from './expressions/FatigueRenderer.js';
import { EyeBlinkSystem } from '../../../core/animation/systems/face/EyeBlinkSystem.js';

/**
 * @class EyeVessel
 * @description
 * ═══════════════════════════════════════════════════════════════
 * CHAPTER 19: THE OBSERVERS OF REALITY (Einayim)
 * ═══════════════════════════════════════════════════════════════
 */
export class EyeVessel {
  static build(id, params) {
    const { x, y, scaleX, blink, morph, skinColor, pupilOffset, emotion, charId } = params;

    // B"H - SAFETY CLAMP: Ensure scaleX never flips into negatives causing bizarre folding
    const direction = Math.sign(scaleX) || 1;
    const magnitude = Math.abs(scaleX);
    const safeScaleX = Math.max(0.1, magnitude) * direction;

    let trueBlink = EyeBlinkSystem.update(blink, 200, charId, id);

    if (emotion === 'sad' || emotion === 'tired') {
      trueBlink = Math.max(trueBlink, 0.4);
    }

    const baseW = 16;
    // B"H - Clamp squint to prevent eyelid geometry inversion
    const safeSquint = Math.max(0.2, Math.min(1.5, morph.squint || 1.0));
    const baseH = 22 * safeSquint;
    const dir   = id === 'right' ? 1 : -1;

    const eyeBoundaryPoints = ScleraPath.get(baseW, baseH);

    const scleraFill = ScleraVessel.build(id, eyeBoundaryPoints);
    const pupil      = PupilRenderer.build(id, pupilOffset, '#111111');
    const eyelids    = EyelidRenderer.build(id, baseW, baseH, trueBlink, skinColor, morph);

    const internals = G.clip(`eye_clip_${id}`, null, eyeBoundaryPoints, [
      scleraFill,
      pupil,
      eyelids
    ]);

    const browY = -baseH - 12;
    const brows = G.path(`eyebrow_${id}`, [
      { type: 'move', x: -baseW * 1.2, y: browY + 5 },
      { type: 'quad', cx: 0, cy: browY - 5, x: baseW * 1.2, y: browY + 5 }
    ], { stroke: '#000', lineWidth: 4, lineCap: 'round' });

    const lashes = [];
    for (let i = 0; i < 3; i++) {
      const lx = (i / 2) * (baseW * 1.8) - (baseW * 0.9);
      lashes.push(G.path(`lash_${id}_${i}`, [
        { type: 'move', x: lx, y: -baseH * 0.7 },
        { type: 'line', x: lx * 1.1, y: -baseH * 0.9 }
      ], { stroke: '#000', lineWidth: 1.2 }));
    }

    const scleraStroke = ScleraVessel.buildStroke(id, eyeBoundaryPoints);

    const eyeElements = [internals, scleraStroke, brows, ...lashes];

    if (emotion === 'happy' || emotion === 'smile') {
      eyeElements.push(CrowsFeetRenderer.build(id, baseW, dir));
    }
    if (emotion === 'angry') {
      eyeElements.push(FurrowRenderer.build(id, baseW, baseH, dir));
    }
    if (emotion === 'sad') {
      eyeElements.push(FatigueRenderer.build(id, baseW, baseH));
    }

    return G.group(`eye_complex_${id}`, { x, y, scaleX: safeScaleX }, eyeElements);
  }
}
