/**
 * B"H
 * Clean hero-first fighter renderer.
 *
 * Chapter 215: the old noisy effects step back. Labels remain, shields remain,
 * but the pixel storm no longer devours the fighter during hits.
 */
import { fighterColor } from './fighter/colors.js';
import { renderLanguage } from './fighter/bodyLanguage.js';
import { drawLabels } from './fighter/labels.js';
import { drawChargeAura, drawDangerAura, drawDodgeStreak, drawShield } from './fighter/auras.js';
import { drawHeroFighter } from './fighter/hero/renderer.js';

export function drawFighters(ctx, fighters) {
  for (const fighter of fighters) drawFighter(ctx, fighter);
}

function drawFighter(ctx, f) {
  if (f.dead || f.hidden || f.respawnTimer) return;
  const color = fighterColor(f);
  const lang = renderLanguage(f);
  if (f.chargeGlow && !f.rapidAttack) drawChargeAura(ctx, f, color);
  if (f.danger || lang.panic > 0.72) drawDangerAura(ctx, f);
  if (f.airDodge) drawDodgeStreak(ctx, f, color);
  drawHeroFighter(ctx, f, color);
  drawLabels(ctx, f);
  if (f.blocking) drawShield(ctx, f);
}
