/**
 * B"H
 * Converter-backed primary hero renderer.
 *
 * Chapter 206: the fighter is now drawn through mockup measurements, sculpted
 * parts, authored keyframes, and material layers.
 */
import { heroPose } from './pose.js';
import { heroMaterial } from './converter/HeroMaterial.js';
import { drawHeroRing } from './body/ring.js';
import { drawHeroLegs, drawHeroArms } from './body/limbs.js';
import { drawHeroTorso } from './body/torso.js';
import { drawHeroHead } from './body/head.js';
import { drawHeroPoseAura } from './effects.js';

export function drawHeroFighter(ctx, f, color) {
  const p = heroPose(f);
  const mat = heroMaterial(color);
  drawHeroPoseAura(ctx, f, p, color);
  drawHeroRing(ctx, p, color, f.human);
  drawHeroLegs(ctx, p, mat);
  drawHeroArms(ctx, p, mat, 'back');
  drawHeroTorso(ctx, p, mat);
  drawHeroArms(ctx, p, mat, 'front');
  drawHeroHead(ctx, p, mat);
}
