/** B"H — Hero limb aggregator: sculpted legs, arm layers, gloves, boots. */
import { drawLegMasses } from './LegMasses.js';
import { drawArmLayer } from './ArmMasses.js';
import { drawHeroGloves } from './HeroGloves.js';
import { drawHeroBoots } from './HeroBoots.js';
export function drawHeroLegs(ctx, p, mat) {
  drawLegMasses(ctx, p, mat);
  drawHeroBoots(ctx, p, mat);
}
export function drawHeroArms(ctx, p, mat, layer) {
  drawArmLayer(ctx, p, mat, layer);
  if (layer === 'front') drawHeroGloves(ctx, p, mat);
}
