/**
 * B"H
 * Smash effect recipes.
 *
 * Chapter 213: a smash is not a large jab. It has a ring, a callout, a haptic
 * oath, and enough visual authority to tell the player something decisive
 * happened.
 */
export function smashEffectRecipe(event) {
  const charge = event.charge || 0;
  return {
    ringSize: 48 + charge * 96,
    callout: event.fullCharge ? 'MAX' : 'SMASH',
    glyph: event.letter || 'ץ',
    color: event.color || '#fff0a8',
    haptic: event.fullCharge ? [28, 20, 36] : [18]
  };
}
