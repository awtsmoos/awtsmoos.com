/**
 * B"H
 * Hyper-real fighter renderer orchestrator.
 *
 * The Awtsmoos has no visible body, yet the visible fighter is surrounded by
 * readable contact, dust, wind, charge, panic, hunter focus, cloth, and human
 * cues. These are sparks around gameplay, never gameplay authority.
 */
import { withGlow } from './lighting/glow.js';
import { fighterColor } from './fighter/colors.js';
import { renderLanguage } from './fighter/bodyLanguage.js';
import { drawBodyMass } from './fighter/body.js';
import { drawLimbs, drawHandsFeet } from './fighter/limbs.js';
import { drawHead } from './fighter/head.js';
import { drawLabels } from './fighter/labels.js';
import { drawAttackArc, drawChargeAura, drawDangerAura, drawDodgeStreak, drawPlayerRing, drawShield } from './fighter/auras.js';
import { drawClothes } from './fighter/clothes/drawClothes.js';
import { drawHumanReadability } from './fighter/human/humanReadability.js';
import { drawBackEffects, drawFrontEffects } from './fighter/effects/effects.js';

export function drawFighters(ctx, fighters) {
  for (const fighter of fighters) drawFighter(ctx, fighter);
}

function drawFighter(ctx, f) {
  if (f.dead || f.hidden || f.respawnTimer) return;
  const color = fighterColor(f);
  const lang = renderLanguage(f);
  drawBackEffects(ctx, f, color);
  drawChargeAura(ctx, f, color);
  if (f.human) drawPlayerRing(ctx, f, color, lang);
  if (f.danger || lang.panic > 0.72) drawDangerAura(ctx, f);
  if (f.airDodge) drawDodgeStreak(ctx, f, color);
  drawClothes(ctx, f, color, 'back');
  drawHumanReadability(ctx, f, color);
  drawBodyMass(ctx, f, color, lang);
  withGlow(ctx, color, f.combo?.count > 2 ? 18 : 10, () => drawLimbs(ctx, f, color, lang));
  drawHandsFeet(ctx, f, color, lang);
  drawClothes(ctx, f, color, 'front');
  drawHead(ctx, f, color, lang);
  drawFrontEffects(ctx, f, color);
  drawLabels(ctx, f);
  if (f.blocking) drawShield(ctx, f);
  if (f.attack) drawAttackArc(ctx, f, color);
}
