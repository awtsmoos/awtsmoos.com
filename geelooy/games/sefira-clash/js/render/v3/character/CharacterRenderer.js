/**
 * B"H
 * V3 character renderer. Sculpted body first, spectacle layered after, so the
 * viewer feels force even before gameplay numbers explain it.
 */
import { material } from './CharacterStyle.js';
import { backArm, frontArm } from './CharacterDepth.js';
import { resolvePose } from './animation/AnimationController.js';
import { drawGroundRing } from './body/GroundRing.js';
import { drawThigh } from './body/Thigh.js';
import { drawShin } from './body/Shin.js';
import { drawBoot } from './body/Boot.js';
import { drawUpperArm } from './body/UpperArm.js';
import { drawForearm } from './body/Forearm.js';
import { drawGlove } from './body/Glove.js';
import { drawNeck } from './body/Neck.js';
import { drawChest } from './body/Chest.js';
import { drawWaist } from './body/Waist.js';
import { drawShoulders } from './body/Shoulder.js';
import { drawHelmet } from './body/Helmet.js';
import { drawVisor } from './body/Visor.js';
import { drawChargeGlow } from '../effects/ChargeGlow.js';
import { drawHitSpark } from '../effects/HitSpark.js';
import { drawImpactFX } from '../effects/ImpactFX.js';
export function drawCharacter(ctx, f, color) {
  const p = resolvePose(f), mat = material(color), shake = Math.min(5, (f.hitstop || 0) * 0.35 + (p.anim?.combo || 0) * 2);
  ctx.save(); if (shake) ctx.translate(Math.sin((f.motionClock || 0) * 1.7) * shake, Math.cos((f.motionClock || 0) * 1.3) * shake * 0.5);
  drawChargeGlow(ctx, f, p, color); drawImpactFX(ctx, f, p, color); drawGroundRing(ctx, p, color, f.human);
  leg(ctx, p, mat, 'left', -1); leg(ctx, p, mat, 'right', 1); arm(ctx, p, mat, backArm(p.face));
  drawNeck(ctx, p, mat); drawChest(ctx, p, mat); drawShoulders(ctx, p, mat); drawWaist(ctx, p, mat);
  arm(ctx, p, mat, frontArm(p.face)); drawHelmet(ctx, p, mat); drawVisor(ctx, p, mat); drawHitSpark(ctx, f, p, color);
  ctx.restore();
}
function arm(ctx, p, mat, side) { drawUpperArm(ctx, p[side+'Shoulder'], p[side+'Elbow'], mat); drawForearm(ctx, p[side+'Elbow'], p[side+'Hand'], mat); drawGlove(ctx, p[side+'Hand'], mat); }
function leg(ctx, p, mat, side, sign) { drawThigh(ctx, p[side+'Hip'], p[side+'Knee'], mat); drawShin(ctx, p[side+'Knee'], p[side+'Foot'], mat); drawBoot(ctx, p[side+'Foot'], sign, mat); }
