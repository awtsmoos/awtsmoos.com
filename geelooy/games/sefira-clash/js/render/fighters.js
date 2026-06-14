/**
 * B"H
 * Capsule-first fighter renderer.
 *
 * Chapter 125: the exposed skeleton retires from the stage. Gameplay bones still
 * calculate the dance, but the eye sees a clean fighter with attached head,
 * visor face, boots, gloves, torso, and readable action silhouette.
 */
import { fighterColor } from './fighter/colors.js';
import { renderLanguage } from './fighter/bodyLanguage.js';
import { drawLabels } from './fighter/labels.js';
import { drawAttackArc, drawChargeAura, drawDangerAura, drawDodgeStreak, drawShield } from './fighter/auras.js';
import { drawBackEffects, drawFrontEffects } from './fighter/effects/effects.js';
import { drawCapsuleFighter } from './fighter/capsule/fighter.js';

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
  drawCapsuleFighter(ctx, f, color, lang);
  drawFrontEffects(ctx, f, color);
  drawLabels(ctx, f);
  if (f.blocking) drawShield(ctx, f);
  if (f.attack) drawAttackArc(ctx, f, color);
}
