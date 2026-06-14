/**
 * B"H
 * Hero-first fighter renderer.
 *
 * Chapter 187: the visible fighter has crossed from capsule into hero form.
 * Existing combat labels, shields, arcs, and effects still surround it.
 */
import { fighterColor } from './fighter/colors.js';
import { renderLanguage } from './fighter/bodyLanguage.js';
import { drawLabels } from './fighter/labels.js';
import { drawAttackArc, drawChargeAura, drawDangerAura, drawDodgeStreak, drawShield } from './fighter/auras.js';
import { drawBackEffects, drawFrontEffects } from './fighter/effects/effects.js';
import { drawHeroFighter } from './fighter/hero/renderer.js';

export function drawFighters(ctx, fighters) {
  for (const fighter of fighters) drawFighter(ctx, fighter);
}

function drawFighter(ctx, f) {
  if (f.dead || f.hidden || f.respawnTimer) return;
  const color = fighterColor(f);
  const lang = renderLanguage(f);
  drawBackEffects(ctx, f, color);
  drawChargeAura(ctx, f, color);
  if (f.danger || lang.panic > 0.72) drawDangerAura(ctx, f);
  if (f.airDodge) drawDodgeStreak(ctx, f, color);
  drawHeroFighter(ctx, f, color);
  drawFrontEffects(ctx, f, color);
  drawLabels(ctx, f);
  if (f.blocking) drawShield(ctx, f);
  if (f.attack) drawAttackArc(ctx, f, color);
}
